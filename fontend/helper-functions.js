// Helper functions for staff page - add these to your staff page component

// Helper function to get booking dates with intelligent fallback
export const getBookingDates = (booking) => {
  // Priority 1: Use booking-level dates if available
  if (booking.checkInDate && booking.checkOutDate) {
    return {
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate
    };
  }

  // Priority 2: Find first service with dates
  const serviceWithDates = booking.services?.find(service => 
    service.checkInDate && service.checkOutDate
  );
  
  if (serviceWithDates) {
    return {
      checkInDate: serviceWithDates.checkInDate,
      checkOutDate: serviceWithDates.checkOutDate
    };
  }

  // Priority 3: Find first combo with dates
  const comboWithDates = booking.combos?.find(combo => 
    combo.checkInDate && combo.checkOutDate
  );
  
  if (comboWithDates) {
    return {
      checkInDate: comboWithDates.checkInDate,
      checkOutDate: comboWithDates.checkOutDate
    };
  }

  // Fallback: Return null if no dates found
  return {
    checkInDate: null,
    checkOutDate: null
  };
};

// Helper function to get number of people with intelligent fallback
const getNumberOfPeople = (booking) => {
  // Priority 1: Use booking-level numberOfPeople if available
  if (booking.numberOfPeople && booking.numberOfPeople > 0) {
    return booking.numberOfPeople;
  }

  // Priority 2: Get from first service
  const firstService = booking.services?.[0];
  if (firstService && firstService.numberOfPeople > 0) {
    return firstService.numberOfPeople;
  }

  // Priority 3: Get from first combo
  const firstCombo = booking.combos?.[0];
  if (firstCombo && firstCombo.numberOfPeople > 0) {
    return firstCombo.numberOfPeople;
  }

  // Fallback: Return 0 if no data found
  return 0;
};

// Usage in your table:
// const dates = getBookingDates(booking);
// const numberOfPeople = getNumberOfPeople(booking);
