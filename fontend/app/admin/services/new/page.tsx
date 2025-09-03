'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageFormData, Gear, GearSelection, Category, AreaData as Area } from '@/app/api/package';
<<<<<<< HEAD
import { fetchGears, fetchCategories, fetchAreas, createPackage, fetchUser } from '@/app/api/admin';
import PackageInfoForm from '../new/components/package-info-form';
import PackageSetupForm from '../new/components/package-setup-form';
import PackageConfirmation from '../new/components/package-confirmation';
import { StepIndicator } from '../new/components/step-indicator';
=======
import { fetchGears, fetchCategories, fetchAreas, createService, fetchUser } from '@/app/api/admin';
import PackageInfoForm from './components/package-info-form';
import PackageConfirmation from './components/package-confirmation';
import { StepIndicator } from './components/step-indicator';
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';

// Define the structure of the API response for errors
interface ApiError {
  status: number;
  data: any;
  message: string;
}
<<<<<<< HEAD

=======
>>>>>>> 4b112d9 (Add or update frontend & backend code)
export default function NewPackagePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PackageFormData>({
<<<<<<< HEAD
    name: '',
    location: '',
    days: '',
    food_type: '',
    tent_type: '',
    activities: '',
    max_people: '',
    available_slots: '',
    price: '',
    description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [gearSelections, setGearSelections] = useState<GearSelection[]>([]);
  const [gears, setGears] = useState<Gear[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

<<<<<<< HEAD
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
      const user = await fetchUser(token, 1); // TODO: thay bằng decode token
      setUserId(Number(user._id));
    } catch (err: any) {
      const status = err.status || 500;
      const message = err.message || 'Failed to fetch user';
      console.error('Error fetching user:', { status, message });
      setError(message);
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      router.push('/login');
      setIsLoading(false); // Quan trọng: dừng loading nếu lỗi
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

      setGears(gearsData);
      setCategories(categoriesData);
      setAreas(areasData);
    } catch (err: any) {
      const status = err.status || 500;
      const message = err.message || 'Failed to fetch data';
      console.error('Error fetching data:', { status, message });
      if (status === 401 || status === 403) {
        setError('Unauthorized. Please log in again.');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        router.push('/login');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false); // Đảm bảo luôn tắt loading
    }
  };

  fetchData();
}, [router]);

  // Handle navigation to the next step
  const handleNext = () => {
    if (currentStep === 1) {
      // Validate required fields for step 1
      if (!formData.name || !formData.location || !formData.days || !formData.max_people || !formData.available_slots || !formData.price) {
        setError('Please fill in all required fields.');
        return;
      }
      if (Number(formData.days) < 1 || Number(formData.max_people) < 1 || Number(formData.available_slots) < 1 || Number(formData.price) < 0) {
        setError('Days, max people, and available slots must be at least 1, and price must be non-negative.');
        return;
      }
    } else if (currentStep === 2) {
      // Validate gear selections for step 2
      if (gearSelections.some((selection) => !selection.gear_id)) {
        setError('Please select a gear for all selections.');
        return;
      }
    }
=======
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

>>>>>>> 4b112d9 (Add or update frontend & backend code)
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD

    // Validate all required fields
    if (!formData.name || !formData.location || !formData.days || !formData.max_people || !formData.available_slots || !formData.price) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await createPackage(token, formData, image, gearSelections);
      // Redirect to the services list after successful submission
      router.push('/admin/services');
    } catch (err: any) {
      const status = err.status || 500;
      const message = err.message || 'Failed to create package';
      console.error('Error creating package:', { status, message });
=======
    try {
      setIsLoading(true);
      setError(null);
      await createService(token, formData, images, gearSelections);
      router.push('/admin/services');
    } catch (err: any) {
      const status = err.status || 500;
      const message = err.message || 'Failed to create service';
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD

=======
  const handleCancel = () => {
    router.back(); // quay về trang trước
  };
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
                image={image}
                setImage={setImage}
              />
            )}
            {currentStep === 2 && (
              <PackageSetupForm
                gears={gears}
                gearSelections={gearSelections}
                setGearSelections={setGearSelections}
                onBack={handleBack}
                onNext={handleNext}
                categories={categories}
                areas={areas}
              />
            )}
            {currentStep === 3 && (
              <PackageConfirmation
                formData={formData}
                image={image}
                gearSelections={gearSelections}
                gears={gears}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Quay lại
                </Button>
              )}
<<<<<<< HEAD
              {currentStep < 3 && (
=======
              {currentStep < 2 && (
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                <Button onClick={handleNext} disabled={isLoading}>
                  Tiếp theo
                </Button>
              )}
<<<<<<< HEAD
              {currentStep === 3 && (
=======
              {currentStep === 2 && (
>>>>>>> 4b112d9 (Add or update frontend & backend code)
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
<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
    </div>
  );
}