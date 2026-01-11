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

  useEffect(() => {
    if (planId) initiatePayment(planId);
  }, [planId]);

  const initiatePayment = async (id: string) => {
    try {
      // create order via backend
      const resp = await apiService.createRazorpayOrder(Number(id));
      if (resp.status !== 'success') throw new Error('Order creation failed');

      const { order_id, amount, currency, key } = resp.data; // backend should send these

      const options = {
        description: 'Plan purchase',
        currency,
        key, // Razorpay Key ID
        amount: amount.toString(),
        order_id,
        prefill: {},
        theme: { color: '#DC2626' }
      } as any;

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            await apiService.verifyRazorpayPayment({ order_id, ...data });
            Alert.alert('Success', 'Payment completed');
            router.back();
          } catch (e) {
            Alert.alert('Verification failed', 'Payment captured but verification failed');
          }
        })
        .catch(() => {
          Alert.alert('Cancelled', 'Payment not completed');
          router.back();
        });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to start payment');
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
