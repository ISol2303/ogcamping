'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageFormData, Gear, GearSelection, Category, AreaData as Area } from '@/app/api/package';
import { fetchGears, fetchCategories, fetchAreas, createService, fetchUser } from '@/app/api/admin';
import PackageInfoForm from './components/package-info-form';
import PackageConfirmation from './components/package-confirmation';
import { StepIndicator } from './components/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';

// Define the structure of the API response for errors
interface ApiError {
  status: number;
  data: any;
  message: string;
}
export default function NewPackagePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    location: "",
    days: "",           // nếu đây là string input, để "" (nếu là số thì đổi thành 0)
    food_type: "",
    tent_type: "",
    activities: "",
    max_people: 0,      // số → mặc định 0
    available_slots: 0, // số → mặc định 0
    price: 0,           // số → mặc định 0
    description: "",

    // bổ sung các field mới theo DTO đã nói
    tag: "",                 // "POPULAR" | "NEW" | "DISCOUNT" | ""
    duration: "",            // "2-3 ngày"
    capacity: "",            // "4-6 người"
    isExperience: false,
    minDays: 1,
    maxDays: 1,
    peoplePerSession: 1,

    minCapacity: 0,
    maxCapacity: 0,
    defaultSlotsPerDay: 0,

    allowExtraPeople: false,
    extraFeePerPerson: 0,
    maxExtraPeople: 0,

    highlights: [],      // ⚠️ phải là mảng
    included: [],        // ⚠️ phải là mảng
    itinerary: [],       // ⚠️ phải là mảng các object
  });

  const [images, setImages] = useState<File[]>([]);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [gearSelections, setGearSelections] = useState<GearSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch user ID to get the token and validate user
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in.');
        router.push('/login');
        return;
      }

      try {
        const user = await fetchUser(token, 1); // TODO: Replace with token decode
        setUserId(Number(user._id));
      } catch (err: any) {
        const status = err.status || 500;
        const message = err.message || 'Failed to fetch user';
        // console.error('Error fetching user:', { status, message });
        setError(message);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        router.push('/login');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Fetch gears, categories, and areas on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in.');
        router.push('/login');
        return;
      }

      try {
        const [gearsData, categoriesData, areasData] = await Promise.all([
          fetchGears(token),
          fetchCategories(token),
          fetchAreas(token),
        ]);

      } catch (err: any) {
        const status = err.status || 500;
        const message = err.message || 'Failed to fetch data';
        // console.error('Error fetching data:', { status, message });
        if (status === 401 || status === 403) {
          setError('Unauthorized. Please log in again.');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          router.push('/login');
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle navigation to the next step
  const validateStep1 = () => {
    const {
      name,
      location,
      price,
      tag,
      isExperience,
      minDays,
      maxDays,
      peoplePerSession,
      minCapacity,
      maxCapacity,
      allowExtraPeople,
      extraFeePerPerson,
      maxExtraPeople,
    } = formData;

    // Required cơ bản
    if (!name || !location || !price) {
      return 'Vui lòng nhập đầy đủ Tên gói, Địa điểm và Giá.';
    }

    if (Number(price) < 0) {
      return 'Giá phải lớn hơn hoặc bằng 0.';
    }

    // Nếu KHÔNG phải trải nghiệm thì bắt buộc nhập minDays và maxDays
    if (!isExperience) {
      if (!minDays || !maxDays) {
        return 'Vui lòng nhập số ngày tối thiểu và tối đa.';
      }
      if (Number(minDays) < 1 || Number(maxDays) < Number(minDays)) {
        return 'Số ngày tối thiểu phải ≥ 1 và nhỏ hơn hoặc bằng số ngày tối đa.';
      }
      // Validate capacity
      if (!minCapacity || !maxCapacity) {
        return 'Vui lòng nhập số người tối thiểu, tối đa';
      }
      if (Number(minCapacity) < 1 || Number(maxCapacity) < Number(minCapacity)) {
        return 'Sức chứa tối thiểu phải ≥ 1 và nhỏ hơn hoặc bằng sức chứa tối đa.';
      }
    } else {
      // Nếu là trải nghiệm thì bắt buộc nhập peoplePerSession
      if (!peoplePerSession || Number(peoplePerSession) < 1) {
        return 'Vui lòng nhập số người / lượt hợp lệ.';
      }
    }



    // Nếu cho phép thêm người thì validate phụ thu
    if (allowExtraPeople) {
      if (!extraFeePerPerson || Number(extraFeePerPerson) <= 0) {
        return 'Phí phụ thu / người phải > 0.';
      }
      if (!maxExtraPeople || Number(maxExtraPeople) < 1) {
        return 'Số người vượt tối đa phải ≥ 1.';
      }
    }
    // ✅ Validate ít nhất 1 ảnh
    if (!images || images.length === 0) {
      return 'Vui lòng chọn ít nhất 1 ảnh minh họa.';
    }

    return null;
  };

  const handleNext = () => {
    let errorMsg: string | null = null;

    if (currentStep === 1) {
      errorMsg = validateStep1();
    }
    // nếu có step 2, 3 thì validate tương tự
    // else if (currentStep === 2) { ... }

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };


  // Handle navigation to the previous step
  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found. Please log in.');
      router.push('/login');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await createService(token, formData, images, gearSelections);
      router.push('/admin/services');
    } catch (err: any) {
      const status = err.status || 500;
      const message = err.message || 'Failed to create service';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }
  const handleCancel = () => {
    router.back(); // quay về trang trước
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tạo gói dịch vụ mới</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step Indicator */}
            <div className="mb-8">
              <StepIndicator currentStep={currentStep} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md text-sm mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Step Content */}
            {currentStep === 1 && (
              <PackageInfoForm
                formData={formData}
                setFormData={setFormData}
                images={images}
                setImages={setImages}
              />
            )}
            {currentStep === 2 && (
              <PackageConfirmation
                formData={formData}
                images={images}
              />
            )}


            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                Huỷ
              </Button>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Quay lại
                </Button>
              )}
              {currentStep < 2 && (
                <Button onClick={handleNext} disabled={isLoading}>
                  Tiếp theo
                </Button>
              )}
              {currentStep === 2 && (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo gói dịch vụ'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}