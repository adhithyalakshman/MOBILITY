// All areas from the backend schema - used in dropdowns
export const AREAS = [
  "Preet Vihar", "Greater Kailash", "Vasant Kunj", "IGI Airport", "Saket",
  "Punjabi Bagh", "Nehru Place", "Dwarka", "Kalkaji", "AIIMS", "Rohini",
  "Okhla", "Civil Lines", "Model Town", "Janakpuri", "Karol Bagh",
  "Connaught Place", "Noida Sector 18", "Chandni Chowk", "Mayur Vihar",
  "Hauz Khas", "Pitampura", "Shahdara", "Rajouri Garden", "Lajpat Nagar"
];

// Delhi area approximate coordinates for map display
export const AREA_COORDINATES = {
  "Preet Vihar":       { lat: 28.6427, lng: 77.2952 },
  "Greater Kailash":   { lat: 28.5508, lng: 77.2406 },
  "Vasant Kunj":       { lat: 28.5245, lng: 77.1586 },
  "IGI Airport":       { lat: 28.5562, lng: 77.1000 },
  "Saket":             { lat: 28.5219, lng: 77.2090 },
  "Punjabi Bagh":      { lat: 28.6726, lng: 77.1315 },
  "Nehru Place":       { lat: 28.5493, lng: 77.2511 },
  "Dwarka":            { lat: 28.5921, lng: 77.0460 },
  "Kalkaji":           { lat: 28.5503, lng: 77.2586 },
  "AIIMS":             { lat: 28.5674, lng: 77.2100 },
  "Rohini":            { lat: 28.7421, lng: 77.1150 },
  "Okhla":             { lat: 28.5384, lng: 77.2783 },
  "Civil Lines":       { lat: 28.6799, lng: 77.2240 },
  "Model Town":        { lat: 28.7178, lng: 77.1916 },
  "Janakpuri":         { lat: 28.6286, lng: 77.0878 },
  "Karol Bagh":        { lat: 28.6514, lng: 77.1908 },
  "Connaught Place":   { lat: 28.6329, lng: 77.2195 },
  "Noida Sector 18":   { lat: 28.5708, lng: 77.3260 },
  "Chandni Chowk":     { lat: 28.6506, lng: 77.2303 },
  "Mayur Vihar":       { lat: 28.6064, lng: 77.2960 },
  "Hauz Khas":         { lat: 28.5494, lng: 77.2001 },
  "Pitampura":         { lat: 28.7007, lng: 77.1500 },
  "Shahdara":          { lat: 28.6720, lng: 77.2937 },
  "Rajouri Garden":    { lat: 28.6490, lng: 77.1226 },
  "Lajpat Nagar":      { lat: 28.5677, lng: 77.2433 },
};

// Enum values from backend
export const WEATHER_CONDITIONS = ["Clear", "Rain", "Fog", "Heatwave"];
export const TRAFFIC_DENSITIES = ["Low", "Medium", "High", "Very High"];
export const ROAD_TYPES = ["Main Road", "Inner Road", "Highway"];
export const TIME_OF_DAY = ["Night", "Morning Peak", "Afternoon", "Evening Peak"];
export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
export const USER_ROLES = ["rider", "driver"];

export const MAP_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi center
