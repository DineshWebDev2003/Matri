import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import { apiService } from '../services/api';
import UniversalHeader from '../components/UniversalHeader';

export default function PaymentScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (planId) initiatePayment(planId);
  }, [planId]);

  const initiatePayment = async (id: string) => {
    try {
      setCurrentPlanId(id);
      // create order via backend
      const resp = await apiService.createRazorpayOrder(Number(id));
      if (resp.status !== 'success') {
        // Handle specific error for free plans
        if (resp.message && resp.message.includes('too low for payment processing')) {
          Alert.alert('Free Plan', 'This is a free plan. No payment required.');
          router.back();
          return;
        }
        throw new Error(resp.message || 'Order creation failed');
      }

      const { order_id, amount, currency, razorpay_key } = resp.data;
      const key = razorpay_key || resp.data.key || '';

      console.log('🔧 Razorpay Checkout Debug:', {
        order_id,
        amount,
        currency,
        razorpay_key,
        key,
        plan_id: currentPlanId,
      });

      const options = {
        description: 'Plan purchase',
        currency,
        key, // Razorpay Key ID
        amount: amount.toString(),
        order_id,
        prefill: {},
        theme: { color: '#DC2626' }
      } as any;

      console.log('🔧 Opening Razorpay with options:', options);

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          console.log('✅ Razorpay payment successful:', data);
          // Razorpay returns: razorpay_payment_id, razorpay_order_id, razorpay_signature
          const payload = {
            order_id: order_id,
            payment_id: data.razorpay_payment_id,
            signature: data.razorpay_signature,
          };
          try {
            await apiService.verifyRazorpayPayment(payload);
            Alert.alert('Success', 'Payment completed');
            router.back();
          } catch (e) {
            console.warn('🔴 Verification error', e);
            Alert.alert('Verification failed', 'Payment captured but verification failed');
          }
        })
        .catch((error: any) => {
          console.error('❌ Razorpay payment error:', error);
          console.error('❌ Error details:', {
            code: error.code,
            description: error.description,
            source: error.source,
            step: error.step,
            reason: error.reason,
          });
          
          // Distinguish cancellation vs other failures
          const cancelled = String(error.code) === '0' || (error.description && /cancel/i.test(error.description));
          const errorMessage = cancelled ? 'Payment cancelled' : 'Something went wrong, please try again later';
          Alert.alert(cancelled ? 'Payment Cancelled' : 'Payment Error', errorMessage);
          router.back();
        });
    } catch (e: any) {
      console.error('⚠️ createRazorpayOrder error', e.response?.data || e.message);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Unable to start payment';
      Alert.alert('Error', 'Something went wrong, please try again later');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <UniversalHeader title="Payment" showBackButton />
      {loading && (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
