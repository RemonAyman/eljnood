import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { isValidEgyptPhone, isRequired, ValidationMessages } from '../../utils/validation';

export const ContactUsScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(() => {
    const errs: Record<string, string> = {};

    if (!isRequired(name)) {
      errs.name = 'يرجى إدخال اسمك الكريم';
    }
    if (!isRequired(phone)) {
      errs.phone = 'يرجى إدخال رقم الموبايل للتواصل';
    } else if (!isValidEgyptPhone(phone)) {
      errs.phone = ValidationMessages.invalidPhone;
    }
    if (!isRequired(message)) {
      errs.message = 'يرجى كتابة رسالتك أو استفسارك';
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'تم الإرسال بنجاح ✅',
        'شكراً لتواصلك مع قادة مجموعة جنود المسيح الكشفية، سيتم الرد عليك في أقرب وقت!',
        [
          {
            text: 'حسناً',
            onPress: () => {
              setName('');
              setPhone('');
              setMessage('');
              setErrors({});
            },
          },
        ]
      );
    }, 600);
  }, [name, phone, message]);

  const openPhone = () => {
    Linking.openURL('tel:+201012345678').catch(() => {
      Alert.alert('تنبيه', 'الرقم: 01012345678');
    });
  };

  const openMail = () => {
    Linking.openURL('mailto:info@scout-jesus.org').catch(() => {
      Alert.alert('تنبيه', 'البريد: info@scout-jesus.org');
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>تواصل معنا</Text>
        <Text style={styles.headerSub}>
          نحن دائماً في خدمتكم.. لا تتردد في التواصل معنا لأي استفسار أو اقتراح
        </Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCardsWrap}>
        <TouchableOpacity
          style={styles.infoCard}
          onPress={openPhone}
          activeOpacity={0.8}
        >
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>📞</Text>
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>رقم الهاتف والواتساب</Text>
            <Text style={styles.infoValue}>+20 10 1234 5678</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={openMail}
          activeOpacity={0.8}
        >
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>✉️</Text>
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>البريد الإلكتروني الرسمي</Text>
            <Text style={styles.infoValue}>info@scout-jesus.org</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>📍</Text>
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>المقر الكشفي</Text>
            <Text style={styles.infoValue}>كنيسة السيدة العذراء مريم - الفوج الأول، أسيوط</Text>
          </View>
        </View>
      </View>

      {/* Social Links Row */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialIcon}>📘</Text>
          <Text style={styles.socialLabel}>فيسبوك</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialIcon}>▶️</Text>
          <Text style={styles.socialLabel}>يوتيوب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialIcon}>📸</Text>
          <Text style={styles.socialLabel}>انستجرام</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>أرسل رسالة مباشرة للقيادة</Text>
        <Text style={styles.formSub}>للاستفسار عن الانضمام أو المعسكرات أو التبرعات</Text>

        <Text style={styles.label}>الاسم بالكامل *</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          placeholder="مثال: يوسف إبراهيم"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: '' }));
          }}
          textAlign="right"
        />
        {errors.name ? <Text style={styles.errText}>{errors.name}</Text> : null}

        <Text style={styles.label}>رقم الموبايل للتواصل *</Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          placeholder="01XXXXXXXXX"
          keyboardType="phone-pad"
          maxLength={11}
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            if (errors.phone) setErrors((e) => ({ ...e, phone: '' }));
          }}
          textAlign="right"
        />
        {errors.phone ? <Text style={styles.errText}>{errors.phone}</Text> : null}

        <Text style={styles.label}>نص الرسالة أو الاستفسار *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.message ? styles.inputError : null]}
          placeholder="اكتب رسالتك هنا بالتفصيل..."
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={(t) => {
            setMessage(t);
            if (errors.message) setErrors((e) => ({ ...e, message: '' }));
          }}
          textAlign="right"
        />
        {errors.message ? <Text style={styles.errText}>{errors.message}</Text> : null}

        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={sending}
          activeOpacity={0.85}
        >
          <Text style={styles.sendBtnText}>
            {sending ? 'جارٍ الإرسال...' : 'أرسل رسالتك الآن ✉️'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCardsWrap: {
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  socialRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 18,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
  },
  formSub: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errText: {
    color: '#EF4444',
    fontSize: 11,
    textAlign: 'right',
    marginTop: -6,
    marginBottom: 8,
  },
  sendBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  sendBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
