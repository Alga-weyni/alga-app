// Lemlem Template System - Handles 90% of questions WITHOUT AI (saves money!)
// Only uses AI for complex questions

import type { PropertyInfo, Booking, Property, User } from "@shared/schema";

export interface LemlemContext {
  user?: User;
  booking?: Booking;
  property?: Property;
  propertyInfo?: PropertyInfo;
}

export interface LemlemResponse {
  message: string;
  usedTemplate: boolean;
  confidence: number; // 0-1, how confident we are this is the right answer
}

// Emergency contacts for Ethiopia
const EMERGENCY_CONTACTS = {
  police: "911",
  ambulance: "907",
  fire: "939",
  touristPolice: "+251-11-155-0202",
};

// Ethiopian Neighborhood-Specific Defaults (Addis Ababa & Popular Cities)
const ETHIOPIAN_NEIGHBORHOODS: Record<string, {
  restaurants: string;
  attractions: string;
  transportation: string;
}> = {
  bole: {
    restaurants: "🍽️ **Top Restaurants in Bole:**\n\n1. **Yod Abyssinia** (Cultural dining, 5 min walk) - Traditional Ethiopian with live music\n2. **Castelli Restaurant** (Italian, 8 min) - Fine dining since 1948\n3. **Tomoca Coffee** (Local café, 10 min) - Best Ethiopian coffee\n4. **Kategna Restaurant** (Ethiopian, 6 min) - Authentic local cuisine\n5. **La Mandoline** (French, 12 min) - Upscale European\n\nEnjoy your meal! ☕️",
    attractions: "🗺️ **Must-Visit Places in Bole:**\n\n1. **Bole Medhanialem Church** (10 min walk) - Beautiful architecture\n2. **Edna Mall** (15 min) - Shopping & entertainment\n3. **Unity Park** (20 min taxi) - Historical palace grounds\n4. **National Museum** (18 min taxi) - Home of 'Lucy' fossils\n5. **Meskel Square** (25 min taxi) - Central gathering place\n\nEthiopia has so much to offer! ✨",
    transportation: "🚕 **Getting Around Bole:**\n\n**Ride Apps:** RIDE (Ethiopian app), Feres (local), ZayRide\n**Taxis:** Available 24/7, negotiate fare beforehand (~100-200 ETB nearby)\n**Bajaj (Tuk-tuk):** Cheap for short trips (~50-80 ETB)\n**Bus:** City buses run frequently (8 ETB)\n\n**To Bole Airport:** 15-20 min, ~200-300 ETB by taxi\n\nSafe travels! 🛣️"
  },
  cmc: {
    restaurants: "🍽️ **Top Restaurants near CMC (Cameroon):**\n\n1. **2000 Habesha** (Ethiopian, 5 min) - Traditional injera & wat\n2. **Lime Tree** (Continental, 8 min) - Popular expat spot\n3. **Gusto Restaurant** (Italian/Pizza, 10 min) - Great for groups\n4. **Dashen Traditional** (Ethiopian, 7 min) - Authentic local experience\n5. **Coffee Break** (Café, 5 min) - Quick bites & espresso\n\nEnjoy Ethiopian hospitality! ☕️",
    attractions: "🗺️ **Must-Visit Places near CMC:**\n\n1. **Entoto Mountain** (30 min taxi) - Panoramic city views\n2. **Ethnological Museum** (15 min) - Inside Haile Selassie's palace\n3. **Shiro Meda Market** (12 min) - Traditional clothing & fabrics\n4. **Trinity Cathedral** (18 min taxi) - Historic church\n5. **Addis Ababa Stadium** (10 min) - Sporting events\n\nExplore Ethiopia's rich culture! ✨",
    transportation: "🚕 **Getting Around CMC:**\n\n**Ride Apps:** RIDE, Feres, ZayRide\n**Taxis:** Plentiful, ~150-250 ETB to city center\n**Bajaj:** Fast for nearby trips (~60-100 ETB)\n**Minibus:** Blue & white minibuses (8-10 ETB)\n\n**To Merkato:** 15 min taxi (~100-150 ETB)\n**To Bole:** 20 min taxi (~200-300 ETB)\n\nSafe travels! 🛣️"
  },
  gerji: {
    restaurants: "🍽️ **Top Restaurants in Gerji:**\n\n1. **Yohannes Kitfo** (Ethiopian, 5 min) - Best kitfo in town\n2. **Antica Restaurant** (Italian, 10 min) - Wood-fired pizza\n3. **Sishu Cafe** (Modern Ethiopian, 8 min) - Fusion cuisine\n4. **Sichuan Restaurant** (Chinese, 12 min) - Authentic Sichuan\n5. **Fresh Touch** (Health food, 6 min) - Salads & smoothies\n\nGreat dining options! ☕️",
    attractions: "🗺️ **Must-Visit Places in Gerji:**\n\n1. **Gullele Botanic Garden** (15 min taxi) - Nature walks\n2. **Science Museum** (10 min taxi) - Interactive exhibits\n3. **Menelik Palace** (20 min taxi) - Historical site\n4. **Addis Ababa University** (15 min) - Campus walks\n5. **Imperial Hotel** (18 min) - Historic landmark\n\nDiscover Addis! ✨",
    transportation: "🚕 **Getting Around Gerji:**\n\n**Ride Apps:** RIDE, Feres (most reliable in Gerji)\n**Taxis:** Easy to find, ~100-200 ETB locally\n**Bajaj:** Quick short trips (~50-80 ETB)\n**Bus:** Regular routes to city center (8 ETB)\n\n**To CMC:** 10 min taxi (~100-150 ETB)\n**To Bole:** 25 min taxi (~250-350 ETB)\n\nEnjoy your stay! 🛣️"
  },
  megenagna: {
    restaurants: "🍽️ **Top Restaurants near Megenagna:**\n\n1. **Capital Hotel & Spa** (Ethiopian buffet, 5 min) - Wide selection\n2. **Kategna** (Traditional Ethiopian, 8 min) - Local favorite\n3. **Dashen Traditional** (Ethiopian, 10 min) - Authentic dining\n4. **Pizza Hut** (Western, 7 min) - Familiar option\n5. **Kaldis Coffee** (Café, 5 min) - Ethiopian coffee culture\n\nDelicious choices nearby! ☕️",
    attractions: "🗺️ **Must-Visit Places near Megenagna:**\n\n1. **Entoto Park** (25 min taxi) - Nature & views\n2. **Friendship Park** (10 min) - Green space for walks\n3. **CMC Area** (15 min taxi) - Shopping & dining\n4. **Shola Market** (8 min) - Local shopping experience\n5. **Jan Meda** (12 min) - Historic gathering place\n\nExplore the area! ✨",
    transportation: "🚕 **Getting Around Megenagna:**\n\n**Ride Apps:** RIDE, Feres, ZayRide\n**Taxis:** Available everywhere, ~100-200 ETB nearby\n**Bajaj:** Common for short trips (~50-100 ETB)\n**Minibus:** Frequent to all parts of city (8-10 ETB)\n\n**To CMC:** 12 min taxi (~120-180 ETB)\n**To Piassa:** 20 min taxi (~180-250 ETB)\n\nSafe journey! 🛣️"
  },
  piassa: {
    restaurants: "🍽️ **Top Restaurants in Piassa (City Center):**\n\n1. **Taitu Hotel** (Historic Ethiopian, 5 min walk) - Since 1907!\n2. **National Hotel** (Ethiopian, 8 min) - Classic dining\n3. **Tomoca Coffee** (Original, 3 min) - Founded 1953\n4. **Castelli Restaurant** (Italian, 12 min) - Historic fine dining\n5. **City View Restaurant** (Rooftop, 10 min) - Panoramic views\n\nHeart of Addis! ☕️",
    attractions: "🗺️ **Must-Visit Places in Piassa:**\n\n1. **National Museum** (5 min walk) - Lucy fossils\n2. **Ethnological Museum** (8 min walk) - Haile Selassie palace\n3. **Trinity Cathedral** (10 min walk) - Stunning architecture\n4. **Merkato** (15 min taxi) - Africa's largest open-air market\n5. **St. George Cathedral** (12 min walk) - Octagonal beauty\n\nHistoric center of Ethiopia! ✨",
    transportation: "🚕 **Getting Around Piassa:**\n\n**Walk:** Most attractions within walking distance!\n**Ride Apps:** RIDE, Feres (downtown can be busy)\n**Taxis:** Everywhere, ~80-150 ETB nearby\n**Bajaj:** Best for quick trips (~40-80 ETB)\n**Bus:** Central hub, routes to everywhere (8 ETB)\n\n**To Bole:** 25 min taxi (~250-350 ETB)\n**To Merkato:** 10 min taxi (~80-120 ETB)\n\nExplore on foot! 🛣️"
  },
  merkato: {
    restaurants: "🍽️ **Top Restaurants near Merkato:**\n\n1. **Merkato Traditional House** (Ethiopian, 5 min) - Local flavors\n2. **Addis Ababa Restaurant** (Ethiopian, 10 min) - Busy lunch spot\n3. **Green Land** (Ethiopian, 8 min) - Vegetarian options\n4. **Al Madina** (Middle Eastern, 12 min) - Halal food\n5. **Fresh Corner** (Street food, 5 min) - Quick local bites\n\nAuthentic Ethiopian experience! ☕️",
    attractions: "🗺️ **Must-Visit Places in Merkato:**\n\n1. **Merkato Market** (5 min walk) - Africa's largest market!\n2. **Adbar area** (10 min) - Traditional goods & spices\n3. **Kera area** (8 min) - Recycled goods & crafts\n4. **St. Joseph Church** (12 min walk) - Historic landmark\n5. **Arada** (15 min taxi) - Old commercial district\n\nShopping paradise! ✨",
    transportation: "🚕 **Getting Around Merkato:**\n\n**Taxis:** Best option for safety, ~100-200 ETB\n**Bajaj:** Available but watch belongings (~50-100 ETB)\n**Minibus:** Central hub, goes everywhere (8-10 ETB)\n**Ride Apps:** Use RIDE or Feres for safety\n\n**To Piassa:** 10 min taxi (~100-150 ETB)\n**To Bole:** 30 min taxi (~300-400 ETB)\n\n⚠️ Keep valuables secure - crowded area!\n\nSafe shopping! 🛣️"
  },
  bishoftu: {
    restaurants: "🍽️ **Top Restaurants in Bishoftu (Debre Zeit):**\n\n1. **Kuriftu Resort** (Resort dining, 10 min) - Lakeside views\n2. **Hora Lake View** (Ethiopian, 8 min) - Fresh fish from crater lake\n3. **Babogaya Lake Viewpoint** (Café, 15 min) - Scenic dining\n4. **Green Park** (Ethiopian, 5 min) - Local favorite\n5. **Pizza Hut** (Western, 7 min) - Familiar option\n\nRelax by the lakes! ☕️",
    attractions: "🗺️ **Must-Visit Places in Bishoftu:**\n\n1. **Kuriftu Crater Lake** (15 min) - Swimming & boating\n2. **Hora Lake** (10 min) - Bird watching paradise\n3. **Bishoftu Lake** (8 min) - Scenic walks\n4. **Green Crater Lake** (20 min) - Peaceful nature\n5. **Babogaya Lake** (12 min) - Stunning views\n\nCity of lakes! ✨",
    transportation: "🚕 **Getting Around Bishoftu:**\n\n**Taxis:** Main transport, ~100-200 ETB locally\n**Bajaj:** Common for short trips (~50-80 ETB)\n**Private Car:** Best for lake hopping\n**Minibus:** To Addis frequently (30-40 ETB)\n\n**To Addis Ababa:** 45 min, ~500-700 ETB by taxi\n**Between Lakes:** 10-20 min, ~150-250 ETB\n\nWeekend getaway! 🛣️"
  },
  adama: {
    restaurants: "🍽️ **Top Restaurants in Adama (Nazret):**\n\n1. **Ras Hotel** (Ethiopian buffet, 5 min) - Wide selection\n2. **Central Adama** (Local, 8 min) - Authentic tibs & kitfo\n3. **Haile Resort** (Resort dining, 15 min) - Spa & food\n4. **Pizza Roma** (Italian, 10 min) - Wood-fired pizza\n5. **Sunshine Café** (Coffee, 5 min) - Local hangout\n\nHighway town hospitality! ☕️",
    attractions: "🗺️ **Must-Visit Places in Adama:**\n\n1. **Sodere Hot Springs** (30 min taxi) - Natural spa\n2. **Haile Resort** (15 min) - Pools & recreation\n3. **Adama University** (10 min) - Campus area\n4. **Central Market** (5 min walk) - Local shopping\n5. **Koka Dam** (20 min) - Scenic reservoir\n\nGateway to the South! ✨",
    transportation: "🚕 **Getting Around Adama:**\n\n**Taxis:** Abundant, ~80-150 ETB locally\n**Bajaj:** Common short trips (~40-80 ETB)\n**Bus Station:** Central hub for all directions\n**Long-distance buses:** To Addis every 30 min (50-70 ETB)\n\n**To Addis Ababa:** 1.5 hours, ~600-800 ETB by taxi\n**To Sodere:** 30 min, ~400-500 ETB\n\nRoad trip hub! 🛣️"
  },
  default: {
    restaurants: "🍽️ **Ethiopian Dining Recommendations:**\n\n**Traditional Ethiopian:**\n- Injera with wat (stew) - National dish\n- Kitfo (minced raw beef) - Delicacy\n- Tibs (sautéed meat) - Popular choice\n- Fasting food (vegan options) - Delicious & healthy\n\n**Coffee Culture:**\n- Ethiopian coffee ceremony - Cultural experience\n- Tomoca Coffee - Historic chain\n- Kaldis Coffee - Modern café\n\n**Tips:**\n- Try \"beyaynetu\" for variety platter\n- Wash hands before eating (injera = utensil!)\n- Say \"betam tafa new!\" (very delicious!)\n\nEthiopian food is amazing! ☕️",
    attractions: "🗺️ **Ethiopia Highlights:**\n\n**Addis Ababa:**\n- National Museum (Lucy fossils)\n- Merkato (largest market in Africa)\n- Entoto Mountain (panoramic views)\n- Trinity Cathedral (stunning architecture)\n\n**Day Trips:**\n- Bishoftu (crater lakes, 45 min)\n- Adama (hot springs, 1.5 hours)\n- Menagesha Forest (nature, 1 hour)\n\n**Cultural Experiences:**\n- Coffee ceremony\n- Traditional music & dance\n- Artisan markets\n\nEthiopia has so much to offer! ✨",
    transportation: "🚕 **Getting Around Ethiopia:**\n\n**Ride Apps (Addis Ababa):**\n- RIDE (most popular)\n- Feres (reliable)\n- ZayRide (budget option)\n\n**Traditional Transport:**\n- Yellow taxis (negotiate fare first)\n- Bajaj (3-wheel tuk-tuk)\n- Blue & white minibuses (cheap!)\n\n**Safety Tips:**\n- Use ride apps when possible\n- Agree on price before starting\n- Keep belongings secure\n- Avoid late night travel alone\n\n**Typical Fares (Addis):**\n- Short trip: 80-150 ETB\n- Cross-city: 200-400 ETB\n- To airport: 300-500 ETB\n\nSafe travels! 🛣️"
  }
};

// Multilingual messages for ALL templates
const MESSAGES = {
  en: {
    emergency: (info: any) => `🚨 **Emergency Contacts in Ethiopia:**\n\n🚓 Police: ${EMERGENCY_CONTACTS.police}\n🚑 Ambulance: ${EMERGENCY_CONTACTS.ambulance}\n🔥 Fire Department: ${EMERGENCY_CONTACTS.fire}\n👮 Tourist Police: ${EMERGENCY_CONTACTS.touristPolice}\n\n${info.nearestHospital ? `Nearest Hospital: ${info.nearestHospital}\n\n` : ""}${info.hostPhone ? `Host/Manager: ${info.hostPhone}\n\n` : ""}Stay safe! Help is on the way. 🙏`,
    lockboxCode: (code: string, location: string, instructions?: string) => `🔑 **Access Information:**\n\n**Lockbox Code:** ${code}\n**Location:** ${location || "At the property entrance"}\n\n${instructions ? `**Instructions:** ${instructions}\n\n` : ""}Welcome to your stay! ✨`,
    lockboxMissing: (phone?: string) => `I don't have the lockbox code in my records yet, dear. ${phone ? `You can call the host at ${phone}` : "Please contact the host directly."}`,
    wifi: (network: string, password: string) => `📶 **WiFi Information:**\n\n**Network Name:** ${network}\n**Password:** ${password}\n\nEnjoy your stay online! ✨`,
    wifiMissing: `I don't have the WiFi details yet, dear. Please ask your host for the network name and password.`,
    checkout: (time: string) => `⏰ **Check-out Time:** ${time}\n\nPlease ensure you leave by this time. Have a safe journey! ✨`,
    checkoutMissing: `Check-out time isn't in my records yet. Please check with your host for the exact time.`,
    checkin: (time: string) => `⏰ **Check-in Time:** ${time}\n\nLooking forward to welcoming you! ✨`,
    checkinMissing: `Check-in time isn't in my records yet. Please check with your host for arrival details.`,
    host: (phone: string, email?: string) => `📞 **Host Contact:**\n\n${phone ? `Phone: ${phone}\n` : ""}${email ? `Email: ${email}\n` : ""}\nFeel free to reach out anytime!`,
  },
  am: { // Amharic
    emergency: (info: any) => `🚨 **የአደጋ ጊዜ እውቂያዎች በኢትዮጵያ:**\n\n🚓 ፖሊስ: ${EMERGENCY_CONTACTS.police}\n🚑 አምቡላንስ: ${EMERGENCY_CONTACTS.ambulance}\n🔥 የእሳት አደጋ: ${EMERGENCY_CONTACTS.fire}\n👮 የቱሪስት ፖሊስ: ${EMERGENCY_CONTACTS.touristPolice}\n\n${info.nearestHospital ? `ቅርብ ሆስፒታል: ${info.nearestHospital}\n\n` : ""}${info.hostPhone ? `አስተናጋጅ/ስራ አስኪያጅ: ${info.hostPhone}\n\n` : ""}ደህንነትዎን ይጠብቁ! እገዛ በመንገድ ላይ ነው። 🙏`,
    lockboxCode: (code: string, location: string, instructions?: string) => `🔑 **የመግቢያ መረጃ:**\n\n**የመቆለፊያ ሳጥን ኮድ:** ${code}\n**ቦታ:** ${location || "በንብረቱ መግቢያ"}\n\n${instructions ? `**መመሪያዎች:** ${instructions}\n\n` : ""}እንኳን ደህና መጡ! ✨`,
    lockboxMissing: (phone?: string) => `የመቆለፊያ ሳጥን ኮድ በመዝገቦቼ ውስጥ የለም። ${phone ? `አስተናጋጁን በ${phone} ይደውሉ` : "እባክዎን አስተናጋጁን በቀጥታ ያነጋግሩ።"}`,
    wifi: (network: string, password: string) => `📶 **WiFi መረጃ:**\n\n**የኔትወርክ ስም:** ${network}\n**የይለፍ ቃል:** ${password}\n\nየመስመር ላይ ቆይታዎን ይደሰቱ! ✨`,
    wifiMissing: `የWiFi ዝርዝሮች ገና የሉም። እባክዎን አስተናጋጅዎን ይጠይቁ።`,
    checkout: (time: string) => `⏰ **የመውጫ ሰዓት:** ${time}\n\nበዚህ ጊዜ መውጣትዎን ያረጋግጡ። ደህንነቱ የተጠበቀ ጉዞ! ✨`,
    checkoutMissing: `የመውጫ ሰዓት በመዝገቦቼ ውስጥ የለም። እባክዎን አስተናጋጅዎን ይጠይቁ።`,
    checkin: (time: string) => `⏰ **የመግቢያ ሰዓት:** ${time}\n\nእናመሰግናለን እናንተን እንቀበላለን! ✨`,
    checkinMissing: `የመግቢያ ሰዓት በመዝገቦቼ ውስጥ የለም። እባክዎን አስተናጋጅዎን ይጠይቁ።`,
    host: (phone: string, email?: string) => `📞 **የአስተናጋጅ እውቂያ:**\n\n${phone ? `ስልክ: ${phone}\n` : ""}${email ? `ኢሜይል: ${email}\n` : ""}\nየትኛውንም ጊዜ ያነጋግሩ!`,
  },
  ti: { // Tigrinya
    emergency: (info: any) => `🚨 **ህጹጽ ርክባት ኣብ ኢትዮጵያ:**\n\n🚓 ፖሊስ: ${EMERGENCY_CONTACTS.police}\n🚑 ኣምቡላንስ: ${EMERGENCY_CONTACTS.ambulance}\n🔥 ሓዊ: ${EMERGENCY_CONTACTS.fire}\n👮 ቱሪስት ፖሊስ: ${EMERGENCY_CONTACTS.touristPolice}\n\n${info.nearestHospital ? `ቀረባ ሆስፒታል: ${info.nearestHospital}\n\n` : ""}${info.hostPhone ? `ኣስተናጋዲ/ኣካየዲ: ${info.hostPhone}\n\n` : ""}ድሕነትኩም ተሓልዉ! ሓገዝ ኣብ መንገዲ ኣሎ። 🙏`,
    lockboxCode: (code: string, location: string, instructions?: string) => `🔑 **ናይ መእተዊ ሓበሬታ:**\n\n**ናይ መቆልፊ ሳጹን ኮድ:** ${code}\n**ቦታ:** ${location || "ኣብ መእተዊ ናይቲ ንብረት"}\n\n${instructions ? `**መምርሒታት:** ${instructions}\n\n` : ""}እንቛዕ ደሓን መጻእኩም! ✨`,
    lockboxMissing: (phone?: string) => `ናይ መቆልፊ ሳጹን ኮድ ኣብ መዝገበይ የለን። ${phone ? `ንኣስተናጋዲ ብ${phone} ደውሉ` : "በጃኹም ንኣስተናጋዲ ብቐጥታ ርከቡ።"}`,
    wifi: (network: string, password: string) => `📶 **WiFi ሓበሬታ:**\n\n**ስም ኔትወርክ:** ${network}\n**ፓስዎርድ:** ${password}\n\nኣብ መስመር ምህላውኩም ኣስተማቕሩ! ✨`,
    wifiMissing: `ዝርዝር WiFi ገና የለን። በጃኹም ንኣስተናጋዲኹም ሓቱ።`,
    checkout: (time: string) => `⏰ **ናይ ምውጻእ ሰዓት:** ${time}\n\nብዚ ሰዓት ምውጻእኩም ኣረጋግጹ። ድሕነት ዘለዎ ጕዕዞ! ✨`,
    checkoutMissing: `ናይ ምውጻእ ሰዓት ኣብ መዝገበይ የለን። በጃኹም ንኣስተናጋዲኹም ሓቱ።`,
    checkin: (time: string) => `⏰ **ናይ መእተዊ ሰዓት:** ${time}\n\nንቕበልኩም ብምዃን ንሓጎስ! ✨`,
    checkinMissing: `ናይ መእተዊ ሰዓት ኣብ መዝገበይ የለን። በጃኹም ንኣስተናጋዲኹም ሓቱ።`,
    host: (phone: string, email?: string) => `📞 **ናይ ኣስተናጋዲ ርክብ:**\n\n${phone ? `ተሌፎን: ${phone}\n` : ""}${email ? `ኢመይል: ${email}\n` : ""}\nኣብ ዝኾነ ግዜ ርከቡ!`,
  },
  om: { // Afaan Oromoo
    emergency: (info: any) => `🚨 **Quunnamtii Ariifachiisaa Itoophiyaa Keessatti:**\n\n🚓 Poolisii: ${EMERGENCY_CONTACTS.police}\n🚑 Ambulaansii: ${EMERGENCY_CONTACTS.ambulance}\n🔥 Ibidda: ${EMERGENCY_CONTACTS.fire}\n👮 Poolisii Turiizimii: ${EMERGENCY_CONTACTS.touristPolice}\n\n${info.nearestHospital ? `Hospitaala Dhiyoo: ${info.nearestHospital}\n\n` : ""}${info.hostPhone ? `Keessummeessaa/Hogganaa: ${info.hostPhone}\n\n` : ""}Nageenya keessan eegaa! Gargaarsi karaa irra jira። 🙏`,
    lockboxCode: (code: string, location: string, instructions?: string) => `🔑 **Odeeffannoo Seensaa:**\n\n**Koodii Sanduqa Cufsaa:** ${code}\n**Bakka:** ${location || "Balbala dhuunfaa irratti"}\n\n${instructions ? `**Qajeelfama:** ${instructions}\n\n` : ""}Baga nagaan dhuftan! ✨`,
    lockboxMissing: (phone?: string) => `Koodiin sanduqa cufsaa galmee koo keessa hin jiru। ${phone ? `Keessummeessaa ${phone} irratti bilbilaa` : "Maaloo keessummeessaa kallattiin quunnamaa።"}`,
    wifi: (network: string, password: string) => `📶 **Odeeffannoo WiFi:**\n\n**Maqaa Networki:** ${network}\n**Jecha Icciitii:** ${password}\n\nTursiimii online keessan itti gammadaa! ✨`,
    wifiMissing: `Qindominni WiFi amma hin jiru। Maaloo keessummeessaa keessan gaafadhaa።`,
    checkout: (time: string) => `⏰ **Sa'aatii Bahuu:** ${time}\n\nMaaloo yeroo kanatti bahuu keessan mirkaneessaa። Imala nagaa! ✨`,
    checkoutMissing: `Sa'aatii bahuu galmee koo keessa hin jiru። Maaloo keessummeessaa keessan gaafadhaa।`,
    checkin: (time: string) => `⏰ **Sa'aatii Seensaa:** ${time}\n\nIsin simachuuf abdii guddaa qabna! ✨`,
    checkinMissing: `Sa'aatii seensaa galmee koo keessa hin jiru। Maaloo keessummeessaa keessan gaafadhaa।`,
    host: (phone: string, email?: string) => `📞 **Quunnamtii Keessummeessaa:**\n\n${phone ? `Bilbilaa: ${phone}\n` : ""}${email ? `Email: ${email}\n` : ""}\nYeroo kamiyyuu quunnamaa!`,
  },
  zh: { // Chinese (Mandarin)
    emergency: (info: any) => `🚨 **埃塞俄比亚紧急联系方式:**\n\n🚓 警察: ${EMERGENCY_CONTACTS.police}\n🚑 救护车: ${EMERGENCY_CONTACTS.ambulance}\n🔥 消防: ${EMERGENCY_CONTACTS.fire}\n👮 旅游警察: ${EMERGENCY_CONTACTS.touristPolice}\n\n${info.nearestHospital ? `最近医院: ${info.nearestHospital}\n\n` : ""}${info.hostPhone ? `房东/经理: ${info.hostPhone}\n\n` : ""}请注意安全！救援正在路上。🙏`,
    lockboxCode: (code: string, location: string, instructions?: string) => `🔑 **入住信息:**\n\n**密码箱密码:** ${code}\n**位置:** ${location || "在房屋入口处"}\n\n${instructions ? `**说明:** ${instructions}\n\n` : ""}欢迎入住！✨`,
    lockboxMissing: (phone?: string) => `我的记录中还没有密码箱密码。${phone ? `您可以拨打 ${phone} 联系房东` : "请直接联系房东。"}`,
    wifi: (network: string, password: string) => `📶 **WiFi信息:**\n\n**网络名称:** ${network}\n**密码:** ${password}\n\n祝您上网愉快！✨`,
    wifiMissing: `我还没有WiFi详细信息。请向您的房东询问网络名称和密码。`,
    checkout: (time: string) => `⏰ **退房时间:** ${time}\n\n请确保在此时间前离开。祝您旅途平安！✨`,
    checkoutMissing: `我的记录中还没有退房时间。请向您的房东确认具体时间。`,
    checkin: (time: string) => `⏰ **入住时间:** ${time}\n\n期待欢迎您的到来！✨`,
    checkinMissing: `我的记录中还没有入住时间。请向您的房东确认到达详情。`,
    host: (phone: string, email?: string) => `📞 **房东联系方式:**\n\n${phone ? `电话: ${phone}\n` : ""}${email ? `邮箱: ${email}\n` : ""}\n随时欢迎您联系!`,
  },
};

// Keywords for pattern matching
const PATTERNS = {
  lockbox: /lockbox|lock box|code|entry code|door code|access code|get in|enter/i,
  wifi: /wifi|wi-fi|internet|password|network|connect/i,
  checkout: /checkout|check out|leave|departure|when.*leave|leaving/i,
  checkin: /checkin|check in|arrive|arrival|when.*arrive|arriving/i,
  emergency: /emergency|urgent|help|police|ambulance|fire|hospital|doctor|medical/i,
  host: /host|owner|contact.*host|call.*host|reach.*host|speak.*host/i,
  parking: /park|parking|car|vehicle|where.*park/i,
  heating: /heat|heating|warm|cold|temperature|thermostat|ac|air condition/i,
  tv: /tv|television|remote|channels|watch/i,
  kitchen: /kitchen|cook|stove|oven|microwave|refrigerator|fridge/i,
  rules: /rules|rule|allowed|can i|smoke|smoking|pet|pets|party|parties|quiet/i,
  restaurants: /restaurant|food|eat|dining|coffee|cafe|where.*eat/i,
  attractions: /attraction|visit|see|do|tourist|sightseeing|places/i,
  transportation: /transport|taxi|bus|ride|uber|bolt|driver|get around/i,
};

/**
 * Helper function to detect neighborhood from property data
 */
function getNeighborhood(property?: Property): string {
  if (!property) return 'default';
  
  const title = property.title?.toLowerCase() || '';
  const city = property.city?.toLowerCase() || '';
  const address = property.address?.toLowerCase() || '';
  
  // Combine all text for better matching
  const fullText = `${title} ${city} ${address}`;
  
  // Match Ethiopian neighborhoods and cities
  if (fullText.includes('bole')) return 'bole';
  if (fullText.includes('cmc') || fullText.includes('cameroon')) return 'cmc';
  if (fullText.includes('gerji')) return 'gerji';
  if (fullText.includes('megenagna') || fullText.includes('megegnagn')) return 'megenagna';
  if (fullText.includes('piassa') || fullText.includes('piaza')) return 'piassa';
  if (fullText.includes('merkato') || fullText.includes('mercato')) return 'merkato';
  if (fullText.includes('bishoftu') || fullText.includes('debre zeit')) return 'bishoftu';
  if (fullText.includes('adama') || fullText.includes('nazret')) return 'adama';
  
  // Default Ethiopian recommendations if no specific neighborhood detected
  return 'default';
}

/**
 * Smart template matcher - finds best response without using AI
 */
export function matchTemplate(
  message: string,
  context: LemlemContext
): LemlemResponse | null {
  const lowerMessage = message.toLowerCase();
  
  // Get user's language preference
  const userPreferences = (context?.user as any)?.preferences || {};
  const language = userPreferences.language || 'en';
  const msg = MESSAGES[language as keyof typeof MESSAGES] || MESSAGES.en;

  // EMERGENCY - Highest priority (instant response)
  if (PATTERNS.emergency.test(message)) {
    const info = {
      nearestHospital: context.propertyInfo?.nearestHospital,
      hostPhone: context.propertyInfo?.hostEmergencyPhone || context.propertyInfo?.propertyManagerPhone,
    };
    return {
      message: msg.emergency(info),
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  // LOCKBOX/ACCESS CODE
  if (PATTERNS.lockbox.test(message)) {
    if (context.propertyInfo?.lockboxCode) {
      return {
        message: msg.lockboxCode(
          context.propertyInfo.lockboxCode,
          context.propertyInfo.lockboxLocation || "",
          context.propertyInfo.entryInstructions || undefined
        ),
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: msg.lockboxMissing(context.propertyInfo?.hostEmergencyPhone || undefined),
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // WIFI PASSWORD
  if (PATTERNS.wifi.test(message)) {
    if (context.propertyInfo?.wifiPassword && context.propertyInfo?.wifiNetwork) {
      return {
        message: msg.wifi(context.propertyInfo.wifiNetwork, context.propertyInfo.wifiPassword),
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: msg.wifiMissing,
        usedTemplate: true,
        confidence: 0.8,
      };
    }
  }

  // CHECK-OUT TIME
  if (PATTERNS.checkout.test(message)) {
    const checkoutTime = context.propertyInfo?.checkOutTime || "11:00 AM";
    if (checkoutTime) {
      return {
        message: msg.checkout(checkoutTime),
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: msg.checkoutMissing,
        usedTemplate: true,
        confidence: 0.8,
      };
    }
  }

  // CHECK-IN TIME
  if (PATTERNS.checkin.test(message)) {
    const checkinTime = context.propertyInfo?.checkInTime || "2:00 PM";
    if (checkinTime) {
      return {
        message: msg.checkin(checkinTime),
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: msg.checkinMissing,
        usedTemplate: true,
        confidence: 0.8,
      };
    }
  }

  // HOST CONTACT
  if (PATTERNS.host.test(message)) {
    const phone = context.propertyInfo?.hostEmergencyPhone || context.propertyInfo?.propertyManagerPhone;
    if (phone) {
      return {
        message: msg.host(phone, undefined),
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: msg.lockboxMissing(), // Reuse same pattern for "missing info"
        usedTemplate: true,
        confidence: 0.7,
      };
    }
  }

  // PARKING
  if (PATTERNS.parking.test(message)) {
    if (context.propertyInfo?.parkingInstructions) {
      return {
        message: `🚗 **Parking Information:**\n\n${context.propertyInfo.parkingInstructions}\n\nIf you need more help, just let me know!`,
        usedTemplate: true,
        confidence: 1.0,
      };
    }
  }

  // HEATING/AC
  if (PATTERNS.heating.test(message)) {
    if (context.propertyInfo?.heatingInstructions || context.propertyInfo?.acInstructions) {
      return {
        message: `🌡️ **Climate Control:**\n\n${
          context.propertyInfo.heatingInstructions
            ? `**Heating:** ${context.propertyInfo.heatingInstructions}\n\n`
            : ""
        }${
          context.propertyInfo.acInstructions
            ? `**Air Conditioning:** ${context.propertyInfo.acInstructions}\n\n`
            : ""
        }Let me know if you need more help getting comfortable!`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // TV
  if (PATTERNS.tv.test(message)) {
    if (context.propertyInfo?.tvInstructions) {
      return {
        message: `📺 **TV Instructions:**\n\n${context.propertyInfo.tvInstructions}\n\nEnjoy your shows! 🍿`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // KITCHEN
  if (PATTERNS.kitchen.test(message)) {
    if (context.propertyInfo?.kitchenAppliances) {
      return {
        message: `🍳 **Kitchen Information:**\n\n${context.propertyInfo.kitchenAppliances}\n\nEnjoy cooking! Let me know if you need anything else.`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // HOUSE RULES
  if (PATTERNS.rules.test(message)) {
    return {
      message: `📋 **House Rules:**\n\n${
        context.propertyInfo?.quietHours
          ? `🔕 Quiet Hours: ${context.propertyInfo.quietHours}\n`
          : ""
      }${
        context.propertyInfo?.smokingAllowed !== undefined
          ? `🚭 Smoking: ${context.propertyInfo.smokingAllowed ? "Allowed" : "Not allowed"}\n`
          : ""
      }${
        context.propertyInfo?.petsAllowed !== undefined
          ? `🐕 Pets: ${context.propertyInfo.petsAllowed ? "Welcome" : "Not allowed"}\n`
          : ""
      }${
        context.propertyInfo?.partiesAllowed !== undefined
          ? `🎉 Parties: ${context.propertyInfo.partiesAllowed ? "Allowed" : "Not allowed"}\n`
          : ""
      }${
        context.propertyInfo?.additionalRules
          ? `\n${context.propertyInfo.additionalRules}\n`
          : ""
      }\nThank you for respecting the property! 🙏`,
      usedTemplate: true,
      confidence: 0.9,
    };
  }

  // RESTAURANTS
  if (PATTERNS.restaurants.test(message)) {
    // Use property-specific data if available
    if (context.propertyInfo?.nearestRestaurants) {
      return {
        message: `🍽️ **Recommended Restaurants Nearby:**\n\n${context.propertyInfo.nearestRestaurants}\n\nEnjoy your meal! Ethiopian food is amazing! ☕️`,
        usedTemplate: true,
        confidence: 1.0,
      };
    }
    
    // Fallback: Use neighborhood-specific defaults based on property location
    const neighborhood = getNeighborhood(context.property);
    const neighborhoodData = ETHIOPIAN_NEIGHBORHOODS[neighborhood] || ETHIOPIAN_NEIGHBORHOODS.default;
    
    return {
      message: neighborhoodData.restaurants,
      usedTemplate: true,
      confidence: 0.85,
    };
  }

  // ATTRACTIONS
  if (PATTERNS.attractions.test(message)) {
    // Use property-specific data if available
    if (context.propertyInfo?.nearestAttractions) {
      return {
        message: `🗺️ **Places to Visit:**\n\n${context.propertyInfo.nearestAttractions}\n\nHave a wonderful time exploring! Ethiopia has so much to offer! ✨`,
        usedTemplate: true,
        confidence: 1.0,
      };
    }
    
    // Fallback: Use neighborhood-specific defaults
    const neighborhood = getNeighborhood(context.property);
    const neighborhoodData = ETHIOPIAN_NEIGHBORHOODS[neighborhood] || ETHIOPIAN_NEIGHBORHOODS.default;
    
    return {
      message: neighborhoodData.attractions,
      usedTemplate: true,
      confidence: 0.85,
    };
  }

  // TRANSPORTATION
  if (PATTERNS.transportation.test(message)) {
    // Use property-specific data if available
    if (context.propertyInfo?.transportationTips) {
      return {
        message: `🚕 **Getting Around:**\n\n${context.propertyInfo.transportationTips}\n\nSafe travels! 🛣️`,
        usedTemplate: true,
        confidence: 1.0,
      };
    }
    
    // Fallback: Use neighborhood-specific defaults
    const neighborhood = getNeighborhood(context.property);
    const neighborhoodData = ETHIOPIAN_NEIGHBORHOODS[neighborhood] || ETHIOPIAN_NEIGHBORHOODS.default;
    
    return {
      message: neighborhoodData.transportation,
      usedTemplate: true,
      confidence: 0.85,
    };
  }

  // No template matched
  return null;
}

/**
 * Fallback responses when no property info is available
 */
/**
 * Multilingual greetings for Ethiopia's major languages
 */
const GREETINGS = {
  en: {
    hello: `Hello, dear! I'm Lemlem, your AI assistant. I'm here to help you with anything during your stay - from lockbox codes to local recommendations. What can I help you with? 😊`,
    thanks: `You're very welcome dear! If you need anything else, I'm here 24/7. Enjoy your stay! ☕️✨`,
  },
  am: { // Amharic
    hello: `ሰላም! እኔ ለምለም ነኝ፣ የእርስዎ AI ረዳት። በእርስዎ ቆይታ ላይ ማንኛውንም ነገር ለመርዳት እዚህ ነኝ። ምን ልረዳዎ? 😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help with anything during your stay. What can I help you with?)`,
    thanks: `በጣም እናመሰግናለን! ሌላ ነገር ከፈለጉ፣ 24/7 እዚህ ነኝ። ቆይታዎን ይደሰቱ! ☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
  ti: { // Tigrinya
    hello: `ሰላም! ኣነ ለምለም እየ፣ AI ሓጋዚኽን። ኣብ ምጽናሕኩም ዝኾነ ነገር ንምሕጋዝ ኣብዚ ኣለኹ። እንታይ ክሕግዘኩም? 😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help with anything during your stay. What can I help you with?)`,
    thanks: `ብጣዕሚ እየ ዘመስግነኩም! ካልእ ነገር እንተደሊኹም፣ 24/7 ኣብዚ ኣለኹ። ምጽናሕኩም ኣስተማቕሩ! ☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
  om: { // Afaan Oromo
    hello: `Nagaa! Ani Lemlem jedhama, gargaaraa AI keessan. Yeroo turisimii keessan keessatti waan kamiyyuu isin gargaaruuf asitti argama. Maal isin gargaaruu danda'a? 😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help with anything during your stay. What can I help you with?)`,
    thanks: `Baay'ee galatoomaa! Waan biraa yoo barbaaddan, 24/7 asittin jira. Turizimii keessan itti gammadaa! ☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
  zh: { // Chinese (Mandarin)
    hello: `您好！我是 Lemlem，您的人工智能助手。我在这里帮助您解决住宿期间的任何问题——从门锁密码到当地推荐。我能帮您什么？😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help you with anything during your stay - from lockbox codes to local recommendations. What can I help you with?)`,
    thanks: `非常欢迎！如果您需要其他帮助，我全天候在这里。祝您入住愉快！☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
};

export function getGeneralHelp(message: string, context?: LemlemContext): LemlemResponse | null {
  const lower = message.toLowerCase();
  const userPreferences = (context?.user as any)?.preferences || {};
  const language = userPreferences.language || 'en';
  const greetings = GREETINGS[language as keyof typeof GREETINGS] || GREETINGS.en;

  // Greeting detection (works in all Ethiopian languages + Chinese)
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || 
      lower.includes("selam") || lower.includes("ሰላም") || lower.includes("nagaa") ||
      lower.includes("你好") || lower.includes("您好") || lower.includes("nihao")) {
    return {
      message: greetings.hello,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  // Thank you detection (works in all Ethiopian languages + Chinese)
  if (lower.includes("thank") || lower.includes("thanks") || 
      lower.includes("ameseginalehu") || lower.includes("አመሰግናለሁ") ||
      lower.includes("谢谢") || lower.includes("感谢") || lower.includes("xiexie") ||
      lower.includes("yeqenyeley") || lower.includes("galatoomaa")) {
    return {
      message: greetings.thanks,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  return null;
}
