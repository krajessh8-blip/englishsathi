export interface RegisteredSchoolData {
  udiseCode: string;
  schoolName: string;
  category: string;
  medium: string;
  state: string;
  district: string;
  taluka: string;
  city: string;
  pincode: string;
  schoolEmail: string;
  schoolPhone: string;
  principalName: string;
  principalPhone: string;
  principalEmail: string;
  principalPassword?: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  coordinatorPassword?: string;
  studentStrength?: string;
  registeredDate: string;
  status?: 'ACTIVE' | 'PENDING' | 'REJECTED';
}

export interface RegisterSchoolResponse {
  success: boolean;
  isDuplicate?: boolean;
  status?: 'ACTIVE' | 'PENDING' | 'REJECTED';
  message: string;
  marathiError?: string;
  school?: RegisteredSchoolData;
}

export async function checkUdiseAvailability(udise: string): Promise<{
  isDuplicate: boolean;
  status?: 'ACTIVE' | 'PENDING';
  schoolName?: string;
  message?: string;
  marathiError?: string;
}> {
  const cleanUdise = udise.trim();
  if (!cleanUdise || cleanUdise.length !== 11) {
    return { isDuplicate: false };
  }

  // First check local pending cache
  try {
    const rawPending = localStorage.getItem('smart_pending_schools');
    if (rawPending) {
      const pendingMap = JSON.parse(rawPending);
      if (pendingMap[cleanUdise]) {
        return {
          isDuplicate: true,
          status: 'PENDING',
          schoolName: pendingMap[cleanUdise].schoolName,
          marathiError: 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.',
        };
      }
    }
  } catch {
    // ignore
  }

  try {
    const res = await fetch(`/api/schools/check-udise/${cleanUdise}`);
    if (res.ok) {
      const data = await res.json();
      return {
        isDuplicate: Boolean(data.isDuplicate || data.exists),
        status: data.status,
        schoolName: data.schoolName,
        message: data.message,
        marathiError: data.marathiError || (data.isDuplicate ? 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.' : undefined),
      };
    }
  } catch (err) {
    console.warn('UDISE check offline fallback:', err);
  }

  return { isDuplicate: false };
}

/**
 * Service function to trigger school registration API call.
 * Registrations are saved in PENDING status until Super Admin approves them.
 */
export async function registerSchoolService(
  schoolRecord: RegisteredSchoolData
): Promise<RegisterSchoolResponse> {
  const cleanUdise = schoolRecord.udiseCode.trim();

  // 1. Pre-check duplicate UDISE locally
  const check = await checkUdiseAvailability(cleanUdise);
  if (check.isDuplicate) {
    return {
      success: false,
      isDuplicate: true,
      message: check.marathiError || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.',
      marathiError: check.marathiError || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.',
    };
  }

  // 2. Call backend registration service endpoint
  try {
    const response = await fetch('/api/schools/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...schoolRecord,
        status: 'PENDING',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 409 || data.duplicateUdise) {
      return {
        success: false,
        isDuplicate: true,
        message: data.marathiError || data.message || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.',
        marathiError: data.marathiError || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.',
      };
    }

    if (response.ok && data.success) {
      // Record in pending cache
      try {
        const rawPending = localStorage.getItem('smart_pending_schools');
        const pendingMap = rawPending ? JSON.parse(rawPending) : {};
        pendingMap[cleanUdise] = {
          ...schoolRecord,
          status: 'PENDING',
        };
        localStorage.setItem('smart_pending_schools', JSON.stringify(pendingMap));

        if (schoolRecord.principalPassword) {
          localStorage.setItem(`school_pwd_principal_${cleanUdise}`, schoolRecord.principalPassword);
        }
        if (schoolRecord.coordinatorPassword) {
          localStorage.setItem(`school_pwd_coord_${cleanUdise}`, schoolRecord.coordinatorPassword);
        }
      } catch {
        // ignore
      }

      return {
        success: true,
        status: 'PENDING',
        message: data.message || 'शाळा नोंदणी यशस्वीरीत्या सादर झाली आहे. सुपर ॲडमिन मंजुरीची प्रतीक्षा आहे.',
        school: {
          ...schoolRecord,
          status: 'PENDING',
        },
      };
    } else {
      return {
        success: false,
        message: data.marathiError || data.message || 'नोंदणी प्रक्रिया पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.',
      };
    }
  } catch (err) {
    console.error('Backend school registration error:', err);
    return {
      success: false,
      message: 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा.',
    };
  }
}
