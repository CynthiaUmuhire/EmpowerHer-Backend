// Placeholder for the actual SMS sending logic
export async function sendSMS(to: string, message: string): Promise<void> {
    const apiKey = process.env.SMS_API_KEY;
    if (!apiKey) {
        throw new Error('SMS API key is not configured');
    }
    const res = await fetch('https://api.callafrica.rw/api/sendTestSMS', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ senderId: "68055f1b6205e1c8c5c78f35", phone: to, message }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send SMS: ${errorText}`);
    }
}

// Notify user about their join request status (approved/declined)
export async function notifyJoinRequestStatus(
    userPhone: string,
    groupOrEventName: string,
    status: 'approved' | 'declined'
): Promise<void> {
    const message = `Your request to join '${groupOrEventName}' has been ${status}.`;
    await sendSMS(userPhone, message);
}

// Notify users about event updates (e.g., time change, location, etc.)
export async function notifyEventUpdate(
    userPhones: string[],
    eventName: string,
    updateDetails: string
): Promise<void> {
    const message = `Update for event '${eventName}': ${updateDetails}`;
    for (const phone of userPhones) {
        await sendSMS(phone, message);
    }
}

// Send a group announcement from admin to all group members
export async function sendGroupAnnouncement(
    memberPhones: string[],
    groupName: string,
    announcement: string
): Promise<void> {
    const message = `Announcement from '${groupName}': ${announcement}`;
    for (const phone of memberPhones) {
        await sendSMS(phone, message);
    }
} 