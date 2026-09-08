export type MockAddress = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const MOCK_ADDRESS_DATABASE: MockAddress[] = [
  // United States
  { line1: "1600 Pennsylvania Avenue NW", city: "Washington", state: "D.C.", postalCode: "20500", country: "United States" },
  { line1: "350 5th Ave", city: "New York", state: "NY", postalCode: "10118", country: "United States" },
  { line1: "1060 W Addison St", city: "Chicago", state: "IL", postalCode: "60613", country: "United States" },
  { line1: "1 Infinite Loop", city: "Cupertino", state: "CA", postalCode: "95014", country: "United States" },
  { line1: "123 Beverly Blvd", city: "Beverly Hills", state: "CA", postalCode: "90210", country: "United States" },

  // India
  { line1: "Rashtrapati Bhavan", city: "New Delhi", state: "Delhi", postalCode: "110004", country: "India" },
  { line1: "Taj Mahal", city: "Agra", state: "Uttar Pradesh", postalCode: "282001", country: "India" },
  { line1: "16, St Mark's Rd", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "India" },
  { line1: "Marine Drive", city: "Mumbai", state: "Maharashtra", postalCode: "400020", country: "India" },
  { line1: "Sector 5, Salt Lake", city: "Kolkata", state: "West Bengal", postalCode: "700091", country: "India" },

  // United Kingdom
  { line1: "10 Downing St", city: "London", state: "Greater London", postalCode: "SW1A 2AA", country: "United Kingdom" },
  { line1: "221B Baker St", city: "London", state: "Greater London", postalCode: "NW1 6XE", country: "United Kingdom" },
  { line1: "Abbey Road", city: "London", state: "Greater London", postalCode: "NW8 9AY", country: "United Kingdom" },

  // Canada
  { line1: "24 Sussex Drive", city: "Ottawa", state: "ON", postalCode: "K1M 1M4", country: "Canada" },
  { line1: "301 Front St W", city: "Toronto", state: "ON", postalCode: "M5V 2T6", country: "Canada" },

  // Australia
  { line1: "1 Sydney Opera House", city: "Sydney", state: "NSW", postalCode: "2000", country: "Australia" },
  { line1: "Federation Square", city: "Melbourne", state: "VIC", postalCode: "3000", country: "Australia" },

  // Germany
  { line1: "Brandenburg Gate", city: "Berlin", state: "Berlin", postalCode: "10117", country: "Germany" },
  { line1: "Marienplatz 1", city: "Munich", state: "Bavaria", postalCode: "80331", country: "Germany" },

  // France
  { line1: "Champs-Elysees 1", city: "Paris", state: "Ile-de-France", postalCode: "75008", country: "France" },
  { line1: "Eiffel Tower", city: "Paris", state: "Ile-de-France", postalCode: "75007", country: "France" },

  // Japan
  { line1: "2-3-1 Asakusa", city: "Taito", state: "Tokyo", postalCode: "111-0032", country: "Japan" },
  { line1: "1-1 Chiyoda", city: "Chiyoda", state: "Tokyo", postalCode: "100-8111", country: "Japan" },
];