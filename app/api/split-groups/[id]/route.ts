import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, phonesMatch } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Fetch user specific collection name and phone
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userPhone = member.phone || member.phoneNumber;
    const { id } = await params;

    // Fetch split group
    const splitGroup = await db.collection('split_groups').findOne({
      _id: new ObjectId(id),
      customer_id: member.customer_id,
    });

    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    // Check if user is a member/contact of this split group
    const isGroupMember = userPhone && splitGroup.contacts?.some((c: any) => phonesMatch(c.phone, userPhone));
    const isGroupOwner = splitGroup.owner === member._id.toString() || splitGroup.owner === member.collection;
    if (!isGroupMember && !isGroupOwner) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Enrich contacts with UPI IDs from member records
    const contactPhones = (splitGroup.contacts || []).map((c: any) => c.phone).filter(Boolean);
    if (contactPhones.length > 0) {
      const members = await db.collection('members').find(
        { $or: [{ phone: { $in: contactPhones } }, { phoneNumber: { $in: contactPhones } }] },
        { projection: { phone: 1, phoneNumber: 1, upiId: 1 } }
      ).toArray();

      const phoneToUpi: Record<string, string> = {};
      members.forEach((m: any) => {
        if (m.upiId) {
          if (m.phone) phoneToUpi[m.phone] = m.upiId;
          if (m.phoneNumber) phoneToUpi[m.phoneNumber] = m.upiId;
        }
      });

      splitGroup.contacts = splitGroup.contacts.map((c: any) => ({
        ...c,
        upiId: phoneToUpi[c.phone] || '',
      }));
    }

    // Fetch all expenses in this split group using the expenses array from split group
    const expenseIds = splitGroup.expenses?.map((expId: string) => new ObjectId(expId)) || [];
    const expenses = expenseIds.length > 0 ? await db
      .collection('expenses')
      .find({
        _id: { $in: expenseIds },
      })
      .toArray() : [];

    return NextResponse.json({ splitGroup, expenses });
  } catch (error) {
    console.error('Error fetching split group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Fetch user specific collection name and phone
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Fetch split group
    const splitGroup = await db.collection('split_groups').findOne({
      _id: new ObjectId(id),
      customer_id: member.customer_id,
    });

    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    // Check if user is the owner
    const isGroupOwner = splitGroup.owner === member._id.toString() || splitGroup.owner === member.collection;
    if (!isGroupOwner) {
      return NextResponse.json({ message: 'Only owner can update split group' }, { status: 403 });
    }

    const body = await request.json();
    const { name, updateContact } = body;

    if (updateContact) {
      const { contactId, phone, email } = updateContact;
      if (!contactId) {
        return NextResponse.json({ message: 'Contact ID required' }, { status: 400 });
      }

      const updateFields: Record<string, any> = {};
      if (phone !== undefined) updateFields['contacts.$.phone'] = phone;
      if (email !== undefined) updateFields['contacts.$.email'] = email;
      updateFields['updatedAt'] = new Date();

      const result = await db.collection('split_groups').updateOne(
        { _id: new ObjectId(id), 'contacts.contactId': contactId },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Contact updated successfully' });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Invalid name' }, { status: 400 });
    }

    const result = await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Split group updated successfully' });
  } catch (error) {
    console.error('Error updating split group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const splitGroup = await db.collection('split_groups').findOne({
      _id: new ObjectId(id),
      customer_id: member.customer_id,
    });

    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    const isGroupOwner = splitGroup.owner === member._id.toString() || splitGroup.owner === member.collection;
    if (!isGroupOwner) {
      return NextResponse.json({ message: 'Only owner can delete split group' }, { status: 403 });
    }

    const deleteResult = await db.collection('split_groups').deleteOne({ _id: new ObjectId(id) });
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    await db.collection('split_group_payments').deleteMany({ splitGroupId: id });
    await db.collection('expenses').updateMany({ split_group_id: id }, { $unset: { split_group_id: '' } });

    return NextResponse.json({ message: 'Split group deleted successfully' });
  } catch (error) {
    console.error('Error deleting split group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
