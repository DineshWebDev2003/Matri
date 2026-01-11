import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import UniversalHeader from '../components/UniversalHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { apiService, premiumUtils } from '../services/api';
import { Colors } from '../constants/Colors';

interface Plan {
  id: number;
  name: string;
  price: number;
  validity_period: number; // days, -1 unlimited
  interest_express_limit: number; // -1 unlimited
  contact_view_limit: number; // -1 unlimited
  image_upload_limit: number; // -1 unlimited
  status: number;
}

export default function PlansScreen() {
  const router = useRouter();
  const { limitation } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const resp = await apiService.getAllPlans();
      if (resp.status === 'success' && Array.isArray(resp.data?.plans)) {
        setPlans(resp.data.plans as Plan[]);
      } else if (Array.isArray(resp.data)) {
        setPlans(resp.data as Plan[]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (plan: Plan) => {
    Alert.alert('Purchase Plan', `Proceed to pay ₹${plan.price}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: () => router.push({ pathname: '/payment', params: { planId: plan.id.toString() } })
      }
    ]);
  };

  const formatNumber = (val: number | string) => {
    const num = parseFloat(String(val));
    if (isNaN(num)) return '-';
    return num % 1 === 0 ? num.toString() : num.toFixed(0);
  };

  const display = (value?: number | string) => {
    if (value === -1) return 'Unlimited';
    if (value === undefined || value === null) return '-';
    return formatNumber(value);
  };

  const renderPlanCard = (plan: Plan) => {
    const isCurrent = limitation?.package_id === plan.id;
    const color = premiumUtils.getPackageColor(plan.id);

    return (
      <View key={plan.id} style={[styles.planCard, isCurrent && styles.currentPlanCard]}>
        <LinearGradient colors={[`${color}30`, `${color}10`]} style={styles.planGradient}>
          {isCurrent && (
            <View style={[styles.currentBadge, { backgroundColor: color }]}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}

          <Text style={[styles.planName, { color }]}>{plan.name}</Text>
          <Text style={styles.price}>₹{formatNumber(plan.price)}</Text>
          <Text style={styles.validity}>{plan.validity_period === -1 ? 'Lifetime' : `${plan.validity_period} Days`}</Text>

          <View style={styles.featureRow}><MaterialIcons name="favorite" size={20} color={color} /><Text style={styles.featureText}>{display(plan.interest_express_limit)} Interests</Text></View>
          <View style={styles.featureRow}><MaterialIcons name="visibility" size={20} color={color} /><Text style={styles.featureText}>{display(plan.contact_view_limit)} Contact Views</Text></View>
          <View style={styles.featureRow}><MaterialIcons name="photo-library" size={20} color={color} /><Text style={styles.featureText}>{display(plan.image_upload_limit)} Photo Uploads</Text></View>

          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: color }, (isCurrent || purchasing === plan.id) && styles.disabledBtn]}
            disabled={isCurrent || purchasing === plan.id}
            onPress={() => handlePurchase(plan)}
          >
            {purchasing === plan.id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buyText}>{isCurrent ? 'ACTIVE' : 'CHOOSE PLAN'}</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UniversalHeader title="Plans & Pricing" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {plans.map(renderPlanCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 16 },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  planCard: { marginBottom: 20, borderRadius: 12, overflow: 'hidden' },
  currentPlanCard: { borderWidth: 2, borderColor: Colors.light.tint },
  planGradient: { padding: 20 },
  currentBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10 },
  currentBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  planName: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  price: { fontSize: 32, fontWeight: '700', textAlign: 'center', color: '#111' },
  validity: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  featureText: { marginLeft: 8, fontSize: 14, color: '#333' },
  buyBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buyText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabledBtn: { opacity: 0.5 }
});