import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

class NotificationService {
  // Send in-app notification to specific users
  async sendInAppNotification(notificationData, recipients) {
    try {
      const batch = [];
      
      for (const recipient of recipients) {
        const userNotification = {
          userId: recipient.id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          read: false,
          createdAt: serverTimestamp(),
          metadata: notificationData.metadata || {},
        };
        
        batch.push(addDoc(collection(db, 'userNotifications'), userNotification));
      }
      
      await Promise.all(batch);
      return { success: true, count: recipients.length };
    } catch (error) {
      console.error('Error sending in-app notifications:', error);
      throw error;
    }
  }

  // Send email notification (requires backend integration)
  async sendEmailNotification(emailData, recipients) {
    try {
      // In a real implementation, this would call a Firebase Function
      // or external email service like SendGrid, Mailgun, etc.
      
      const emailLog = {
        subject: emailData.subject,
        body: emailData.body,
        recipients: recipients.map(r => r.email).filter(Boolean),
        sentBy: emailData.sentBy,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      
      // Log email attempt
      await addDoc(collection(db, 'emailLogs'), emailLog);
      
      // Here you would call your email service
      // Example with Firebase Functions:
      // const sendEmail = httpsCallable(functions, 'sendEmail');
      // await sendEmail({ emailData, recipients });
      
      console.log('Email notification logged for:', recipients.map(r => r.email));
      return { success: true, count: recipients.length };
    } catch (error) {
      console.error('Error sending email notifications:', error);
      throw error;
    }
  }

  // Send SMS notification (requires backend integration)
  async sendSMSNotification(smsData, recipients) {
    try {
      // In a real implementation, this would integrate with Twilio, AWS SNS, etc.
      
      const smsLog = {
        message: smsData.message,
        recipients: recipients.map(r => r.phone).filter(Boolean),
        sentBy: smsData.sentBy,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      
      // Log SMS attempt
      await addDoc(collection(db, 'smsLogs'), smsLog);
      
      // Here you would call your SMS service
      // Example with Twilio:
      // await twilioClient.messages.create({ ... });
      
      console.log('SMS notification logged for:', recipients.map(r => r.phone));
      return { success: true, count: recipients.length };
    } catch (error) {
      console.error('Error sending SMS notifications:', error);
      throw error;
    }
  }

  // Get user notifications for a specific user
  async getUserNotifications(userId, limit = 50) {
    try {
      const q = query(
        collection(db, 'userNotifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'userNotifications', notificationId), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Send push notification (requires service worker setup)
  async sendPushNotification(pushData, recipients) {
    try {
      // This would integrate with Firebase Cloud Messaging (FCM)
      // or another push notification service
      
      const pushLog = {
        title: pushData.title,
        body: pushData.body,
        recipients: recipients.map(r => r.fcmToken).filter(Boolean),
        sentBy: pushData.sentBy,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      
      // Log push notification attempt
      await addDoc(collection(db, 'pushLogs'), pushLog);
      
      // Here you would call FCM or your push service
      console.log('Push notification logged for:', recipients.length, 'users');
      return { success: true, count: recipients.length };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  // Create notification template
  async createTemplate(templateData) {
    try {
      const template = {
        name: templateData.name,
        title: templateData.title,
        message: templateData.message,
        type: templateData.type,
        category: templateData.category,
        variables: templateData.variables || [],
        createdBy: templateData.createdBy,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'notificationTemplates'), template);
      return { id: docRef.id, ...template };
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  }

  // Get notification templates
  async getTemplates() {
    try {
      const q = query(
        collection(db, 'notificationTemplates'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      throw error;
    }
  }

  // Send notification using template
  async sendFromTemplate(templateId, variables, recipients, channels) {
    try {
      // Get template
      const templateDoc = await getDoc(doc(db, 'notificationTemplates', templateId));
      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }
      
      const template = templateDoc.data();
      
      // Replace variables in template
      let title = template.title;
      let message = template.message;
      
      Object.entries(variables).forEach(([key, value]) => {
        title = title.replace(new RegExp(`{{${key}}}`, 'g'), value);
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      
      // Send notification
      const notificationData = {
        title,
        message,
        type: template.type,
      };
      
      const results = [];
      
      if (channels.inApp) {
        results.push(await this.sendInAppNotification(notificationData, recipients));
      }
      
      if (channels.email) {
        results.push(await this.sendEmailNotification(notificationData, recipients));
      }
      
      if (channels.sms) {
        results.push(await this.sendSMSNotification(notificationData, recipients));
      }
      
      return results;
    } catch (error) {
      console.error('Error sending notification from template:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(timeRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);
      
      // This would require more complex queries in a real implementation
      // For now, return basic stats
      
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      const notifications = querySnapshot.docs.map(doc => doc.data());
      
      return {
        totalSent: notifications.filter(n => n.status === 'sent').length,
        totalScheduled: notifications.filter(n => n.status === 'scheduled').length,
        totalFailed: notifications.filter(n => n.status === 'failed').length,
        totalRecipients: notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0),
        byType: {
          info: notifications.filter(n => n.type === 'info').length,
          success: notifications.filter(n => n.type === 'success').length,
          warning: notifications.filter(n => n.type === 'warning').length,
          error: notifications.filter(n => n.type === 'error').length,
        },
        byChannel: {
          inApp: notifications.filter(n => n.channels?.inApp).length,
          email: notifications.filter(n => n.channels?.email).length,
          sms: notifications.filter(n => n.channels?.sms).length,
        },
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
}

export default new NotificationService();
