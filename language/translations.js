// Translation system
let currentLanguage = 'en';

// Translations object
const translations = {
    en: {
        home: "Home",
        about: "About",
        products: "Products",
        contact: "Contact",
        login: "Login",
        register: "Register",
        profile: "Profile",
        logout: "Logout",
        crop_rotation: "CropShiftX",
        agrirevive: "AgriReVive",
        bio_guardian: "BioGuardian",
        grain_trust: "GrainTrust",
        agrirevive_title: "AgriReVive",
        agrirevive_desc: "Innovative biofuel production system that converts agricultural waste into clean energy, reducing carbon emissions and providing alternative fuel solutions.",
        smart_farm: "Smart Farm",
        quick_links: "Quick Links",
        contact_us: "Contact Us",
        email_contact: "Email: info@biobloom.com",
        phone_contact: "Phone: +91 1234567890",
        sustainable_farming: "Sustainable Farming for Cleaner Air",
        hero_description: "Harness the power of AI to make farming smarter and greener. Get real-time insights to reduce pollution and boost crop yields. Optimize resources naturally while protecting the environment. Sustainable agriculture starts with smart decisions!",
        get_started: "Get Started",
        our_products: "Our Products",
        crop_rotation_title: "CropShiftX",
        crop_rotation_desc: "AI-powered crop rotation assistant that helps farmers optimize their planting schedules and improve soil health through intelligent crop rotation recommendations.",
        ecofarm_title: "EcoFarm Assistant",
        ecofarm_desc: "Comprehensive farming companion that monitors air quality, provides sustainable farming recommendations, and helps maintain environmental balance.",
        aqi_alerts: "AQI-Based Alerts",
        aqi_alerts_desc: "Get real-time alerts and recommendations for optimal farming activities based on current air quality levels, helping reduce exposure to harmful conditions.",
        why_choose: "Why Choose BioBloom Solutions?",
        innovation: "Innovation",
        innovation_desc: "Our AI-powered solutions combine cutting-edge technology with sustainable practices, making us the leader in smart farming and environmental solutions.",
        proven_results: "Proven Results",
        proven_results_desc: "Our integrated approach has helped farmers achieve remarkable results: improved yields, reduced costs, and significant environmental impact reduction across all implementations.",
        key_advantages: "Key Advantages",
        advantage1: "Real-time monitoring and insights",
        advantage2: "Integrated smart farming solutions",
        advantage3: "Sustainable waste-to-energy conversion",
        advantage4: "24/7 environmental tracking",
        advanced_tech: "Advanced Technology",
        advanced_tech_desc: "Our solutions leverage machine learning, IoT sensors, and advanced analytics to provide precise, actionable insights for optimal farming and environmental management.",
        env_impact: "Environmental Impact",
        impact1: "40% reduction in environmental pollution",
        impact2: "60% decrease in resource wastage",
        impact3: "Sustainable energy production",
        impact4: "Enhanced biodiversity protection",
        impact5: "Improved air quality management",
        customer_satisfaction: "Customer Satisfaction",
        cost_reduction: "Cost Reduction",
        efficiency_increase: "Efficiency Increase",
        env_impact_reduction: "Environmental Impact",
        growth_impact: "Growth Impact Analysis",
        understanding_impact: "Understanding the Impact",
        understanding_impact_desc: "This graph demonstrates how BioBloom's smart farming solutions significantly enhance plant growth and health compared to traditional farming methods. Our integrated approach combines AI-driven monitoring, optimal resource allocation, and sustainable practices.",
        growth_metrics: "Growth Metrics",
        growth_metrics_desc: "Our solutions have consistently shown remarkable improvements in key agricultural metrics, demonstrating superior performance in crop yield, resource efficiency, and overall farm productivity compared to traditional methods."
    },
    hi: {
        home: "होम",
        about: "हमारे बारे में",
        products: "उत्पाद",
        contact: "संपर्क",
        login: "लॉग इन",
        register: "रजिस्टर",
        profile: "प्रोफ़ाइल",
        logout: "लॉग आउट",
        crop_rotation: "क्रॉपशिफ्टएक्स",
        agrirevive: "एग्रीरिवाइव",
        agrirevive_title: "एग्रीरिवाइव",
        agrirevive_desc: "कृषि अपशिष्ट को स्वच्छ ऊर्जा में परिवर्तित करने वाली नवीन बायोफ्यूल उत्पादन प्रणाली, जो कार्बन उत्सर्जन को कम करती है और वैकल्पिक ईंधन समाधान प्रदान करती है।",
        smart_farm: "स्मार्ट फार्म",
        quick_links: "त्वरित लिंक",
        contact_us: "संपर्क करें",
        email_contact: "ईमेल: info@biobloom.com",
        phone_contact: "फोन: +91 1234567890",
        sustainable_farming: "स्वच्छ हवा के लिए स्थायी खेती",
        hero_description: "खेती को स्मार्ट और हरित बनाने के लिए AI की शक्ति का उपयोग करें। प्रदूषण को कम करने और फसल की पैदावार बढ़ाने के लिए वास्तविक समय की जानकारी प्राप्त करें। पर्यावरण की रक्षा करते हुए संसाधनों का प्राकृतिक रूप से अनुकूलन करें। स्थायी कृषि स्मार्ट निर्णयों से शुरू होती है!",
        get_started: "शुरू करें",
        our_products: "हमारे उत्पाद",
        crop_rotation_title: "क्रॉपशिफ्टएक्स",
        crop_rotation_desc: "AI-संचालित फसल रोटेशन सहायक जो किसानों को उनके रोपण कार्यक्रमों को अनुकूलित करने और बुद्धिमान फसल रोटेशन सिफारिशों के माध्यम से मिट्टी की सेहत में सुधार करने में मदद करता है।",
        ecofarm_title: "इकोफार्म सहायक",
        ecofarm_desc: "व्यापक खेती साथी जो वायु गुणवत्ता की निगरानी करता है, स्थायी खेती की सिफारिशें प्रदान करता है, और पर्यावरणीय संतुलन बनाए रखने में मदद करता है।",
        aqi_alerts: "AQI-आधारित अलर्ट",
        aqi_alerts_desc: "वर्तमान वायु गुणवत्ता स्तरों के आधार पर इष्टतम खेती गतिविधियों के लिए वास्तविक समय के अलर्ट और सिफारिशें प्राप्त करें, जिससे हानिकारक स्थितियों के संपर्क को कम करने में मदद मिलती है।",
        why_choose: "बायोब्लूम समाधान क्यों चुनें?",
        innovation: "नवाचार",
        innovation_desc: "हमारे AI-संचालित समाधान अत्याधुनिक प्रौद्योगिकी को स्थायी प्रथाओं के साथ जोड़ते हैं, जिससे हम स्मार्ट खेती और पर्यावरणीय समाधानों में अग्रणी बनते हैं।",
        proven_results: "सिद्ध परिणाम",
        proven_results_desc: "हमारे एकीकृत दृष्टिकोण ने किसानों को उल्लेखनीय परिणाम प्राप्त करने में मदद की है: बेहतर पैदावार, कम लागत, और सभी कार्यान्वयनों में महत्वपूर्ण पर्यावरणीय प्रभाव में कमी।",
        key_advantages: "मुख्य लाभ",
        advantage1: "वास्तविक समय की निगरानी और अंतर्दृष्टि",
        advantage2: "एकीकृत स्मार्ट खेती समाधान",
        advantage3: "स्थायी अपशिष्ट-से-ऊर्जा रूपांतरण",
        advantage4: "24/7 पर्यावरणीय ट्रैकिंग",
        advanced_tech: "उन्नत प्रौद्योगिकी",
        advanced_tech_desc: "हमारे समाधान मशीन लर्निंग, IoT सेंसर, और उन्नत विश्लेषण का उपयोग करके इष्टतम खेती और पर्यावरणीय प्रबंधन के लिए सटीक, क्रियाशील अंतर्दृष्टि प्रदान करते हैं।",
        env_impact: "पर्यावरणीय प्रभाव",
        impact1: "पर्यावरणीय प्रदूषण में 40% की कमी",
        impact2: "संसाधन अपव्यय में 60% की कमी",
        impact3: "स्थायी ऊर्जा उत्पादन",
        impact4: "बढ़ी हुई जैव विविधता सुरक्षा",
        impact5: "बेहतर वायु गुणवत्ता प्रबंधन",
        customer_satisfaction: "ग्राहक संतुष्टि",
        cost_reduction: "लागत में कमी",
        efficiency_increase: "दक्षता में वृद्धि",
        env_impact_reduction: "पर्यावरणीय प्रभाव",
        growth_impact: "विकास प्रभाव विश्लेषण",
        understanding_impact: "प्रभाव को समझना",
        understanding_impact_desc: "यह ग्राफ दर्शाता है कि बायोब्लूम के स्मार्ट खेती समाधान पारंपरिक खेती विधियों की तुलना में पौधों के विकास और स्वास्थ्य को कैसे महत्वपूर्ण रूप से बढ़ाते हैं। हमारा एकीकृत दृष्टिकोण AI-संचालित निगरानी, इष्टतम संसाधन आवंटन, और स्थायी प्रथाओं को जोड़ता है।",
        growth_metrics: "विकास मेट्रिक्स",
        growth_metrics_desc: "हमारे समाधानों ने लगातार प्रमुख कृषि मेट्रिक्स में उल्लेखनीय सुधार दिखाया है, जिससे फसल की पैदावार, संसाधन दक्षता, और समग्र खेत उत्पादकता में पारंपरिक विधियों की तुलना में बेहतर प्रदर्शन प्रदर्शित किया है।"
    },
    kn: {
        home: "ಮುಖಪುಟ",
        about: "ನಮ್ಮ ಬಗ್ಗೆ",
        products: "ಉತ್ಪನ್ನಗಳು",
        contact: "ಸಂಪರ್ಕ",
        login: "ಲಾಗಿನ್",
        register: "ನೋಂದಣಿ",
        profile: "ಪ್ರೊಫೈಲ್",
        logout: "ಲಾಗ್ ಔಟ್",
        crop_rotation: "ಕ್ರಾಪ್‌ಶಿಫ್ಟ್‌ಎಕ್ಸ್",
        agrirevive: "ಅಗ್ರಿರಿವೈವ್",
        agrirevive_title: "ಅಗ್ರಿರಿವೈವ್",
        agrirevive_desc: "ಕೃಷಿ ತ್ಯಾಜ್ಯವನ್ನು ಸ್ವಚ್ಛ ಶಕ್ತಿಯಾಗಿ ಪರಿವರ್ತಿಸುವ ನವೀನ ಜೈವಿಕ ಇಂಧನ ಉತ್ಪಾದನಾ ವ್ಯವಸ್ಥೆ, ಇದು ಇಂಗಾಲದ ಹೊರಸೂಸುವಿಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ ಮತ್ತು ಪರ್ಯಾಯ ಇಂಧನ ಪರಿಹಾರಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.",
        smart_farm: "ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್",
        quick_links: "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು",
        contact_us: "ಸಂಪರ್ಕಿಸಿ",
        email_contact: "ಇಮೇಲ್: info@biobloom.com",
        phone_contact: "ಫೋನ್: +91 1234567890",
        sustainable_farming: "ಸ್ವಚ್ಛ ಗಾಳಿಗಾಗಿ ಸುಸ್ಥಿರ ಕೃಷಿ",
        hero_description: "ಕೃಷಿಯನ್ನು ಸ್ಮಾರ್ಟ್ ಮತ್ತು ಹಸಿರು ಮಾಡಲು AI ಶಕ್ತಿಯನ್ನು ಬಳಸಿ. ಮಾಲಿನ್ಯವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಬೆಳೆ ಇಳುವರಿಯನ್ನು ಹೆಚ್ಚಿಸಲು ನೈಜ-ಸಮಯ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ. ಪರಿಸರವನ್ನು ರಕ್ಷಿಸುತ್ತಾ ಸ್ವಾಭಾವಿಕವಾಗಿ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಅನುಕೂಲಗೊಳಿಸಿ. ಸುಸ್ಥಿರ ಕೃಷಿ ಸ್ಮಾರ್ಟ್ ನಿರ್ಧಾರಗಳೊಂದಿಗೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ!",
        get_started: "ಪ್ರಾರಂಭಿಸಿ",
        our_products: "ನಮ್ಮ ಉತ್ಪನ್ನಗಳು",
        crop_rotation_title: "ಕ್ರಾಪ್‌ಶಿಫ್ಟ್‌ಎಕ್ಸ್",
        crop_rotation_desc: "AI-ಚಾಲಿತ ಬೆಳೆ ತಿರುಗುವಿಕೆ ಸಹಾಯಕ, ಇದು ರೈತರಿಗೆ ಅವರ ನೆಡುವಿಕೆ ವೇಳಾಪಟ್ಟಿಗಳನ್ನು ಅನುಕೂಲಗೊಳಿಸಲು ಮತ್ತು ಬುದ್ಧಿವಂತ ಬೆಳೆ ತಿರುಗುವಿಕೆ ಶಿಫಾರಸುಗಳ ಮೂಲಕ ಮಣ್ಣಿನ ಆರೋಗ್ಯವನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
        ecofarm_title: "ಇಕೋಫಾರ್ಮ್ ಸಹಾಯಕ",
        ecofarm_desc: "ವ್ಯಾಪಕ ಕೃಷಿ ಸಹಚರ, ಇದು ಗಾಳಿಯ ಗುಣಮಟ್ಟವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತದೆ, ಸುಸ್ಥಿರ ಕೃಷಿ ಶಿಫಾರಸುಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ, ಮತ್ತು ಪರಿಸರ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
        aqi_alerts: "AQI-ಆಧಾರಿತ ಎಚ್ಚರಿಕೆಗಳು",
        aqi_alerts_desc: "ಪ್ರಸ್ತುತ ಗಾಳಿಯ ಗುಣಮಟ್ಟದ ಮಟ್ಟಗಳ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳಿಗಾಗಿ ನೈಜ-ಸಮಯ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ, ಇದು ಹಾನಿಕಾರಕ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಒಡ್ಡುವಿಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
        why_choose: "ಬಯೋಬ್ಲೂಮ್ ಪರಿಹಾರಗಳನ್ನು ಏಕೆ ಆರಿಸಬೇಕು?",
        innovation: "ನಾವೀನ್ಯತೆ",
        innovation_desc: "ನಮ್ಮ AI-ಚಾಲಿತ ಪರಿಹಾರಗಳು ಅತ್ಯಾಧುನಿಕ ತಂತ್ರಜ್ಞಾನವನ್ನು ಸುಸ್ಥಿರ ಅಭ್ಯಾಸಗಳೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತವೆ, ಇದು ನಮ್ಮನ್ನು ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಮತ್ತು ಪರಿಸರ ಪರಿಹಾರಗಳಲ್ಲಿ ಮುಂಚೂಣಿಯಲ್ಲಿರುವಂತೆ ಮಾಡುತ್ತದೆ.",
        proven_results: "ಸಾಬೀತಾದ ಫಲಿತಾಂಶಗಳು",
        proven_results_desc: "ನಮ್ಮ ಸಮಗ್ರ ವಿಧಾನವು ರೈತರಿಗೆ ಗಮನಾರ್ಹ ಫಲಿತಾಂಶಗಳನ್ನು ಸಾಧಿಸಲು ಸಹಾಯ ಮಾಡಿದೆ: ಸುಧಾರಿತ ಇಳುವರಿ, ಕಡಿಮೆ ವೆಚ್ಚ, ಮತ್ತು ಎಲ್ಲಾ ಅನುಷ್ಠಾನಗಳಲ್ಲಿ ಗಮನಾರ್ಹ ಪರಿಸರ ಪ್ರಭಾವದಲ್ಲಿ ಇಳಿಕೆ.",
        key_advantages: "ಪ್ರಮುಖ ಅನುಕೂಲಗಳು",
        advantage1: "ನೈಜ-ಸಮಯ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಒಳನೋಟಗಳು",
        advantage2: "ಸಮಗ್ರ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಪರಿಹಾರಗಳು",
        advantage3: "ಸುಸ್ಥಿರ ತ್ಯಾಜ್ಯ-ಇಂಧನ ಪರಿವರ್ತನೆ",
        advantage4: "24/7 ಪರಿಸರ ಟ್ರ್ಯಾಕಿಂಗ್",
        advanced_tech: "ಅತ್ಯಾಧುನಿಕ ತಂತ್ರಜ್ಞಾನ",
        advanced_tech_desc: "ನಮ್ಮ ಪರಿಹಾರಗಳು ಯಂತ್ರ ಕಲಿಕೆ, IoT ಸಂವೇದಕಗಳು, ಮತ್ತು ಅತ್ಯಾಧುನಿಕ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಬಳಸಿಕೊಂಡು ಸೂಕ್ತ ಕೃಷಿ ಮತ್ತು ಪರಿಸರ ನಿರ್ವಹಣೆಗಾಗಿ ನಿಖರ, ಕ್ರಿಯಾತ್ಮಕ ಒಳನೋಟಗಳನ್ನು ಒದಗಿಸುತ್ತವೆ.",
        env_impact: "ಪರಿಸರ ಪ್ರಭಾವ",
        impact1: "ಪರಿಸರ ಮಾಲಿನ್ಯದಲ್ಲಿ 40% ಇಳಿಕೆ",
        impact2: "ಸಂಪನ್ಮೂಲ ತ್ಯಾಜ್ಯದಲ್ಲಿ 60% ಇಳಿಕೆ",
        impact3: "ಸುಸ್ಥಿರ ಶಕ್ತಿ ಉತ್ಪಾದನೆ",
        impact4: "ಹೆಚ್ಚಿದ ಜೀವವೈವಿಧ್ಯ ರಕ್ಷಣೆ",
        impact5: "ಸುಧಾರಿತ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ನಿರ್ವಹಣೆ",
        customer_satisfaction: "ಗ್ರಾಹಕ ತೃಪ್ತಿ",
        cost_reduction: "ವೆಚ್ಚದ ಇಳಿಕೆ",
        efficiency_increase: "ದಕ್ಷತೆಯ ಹೆಚ್ಚಳ",
        env_impact_reduction: "ಪರಿಸರ ಪ್ರಭಾವ",
        growth_impact: "ಬೆಳವಣಿಗೆ ಪ್ರಭಾವ ವಿಶ್ಲೇಷಣೆ",
        understanding_impact: "ಪ್ರಭಾವವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು",
        understanding_impact_desc: "ಈ ಗ್ರಾಫ್ ಬಯೋಬ್ಲೂಮ್‌ನ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಪರಿಹಾರಗಳು ಸಾಂಪ್ರದಾಯಿಕ ಕೃಷಿ ವಿಧಾನಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ಸಸ್ಯ ಬೆಳವಣಿಗೆ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ಹೇಗೆ ಗಮನಾರ್ಹವಾಗಿ ಹೆಚ್ಚಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ತೋರಿಸುತ್ತದೆ. ನಮ್ಮ ಸಮಗ್ರ ವಿಧಾನವು AI-ಚಾಲಿತ ಮೇಲ್ವಿಚಾರಣೆ, ಸೂಕ್ತ ಸಂಪನ್ಮೂಲ ಹಂಚಿಕೆ, ಮತ್ತು ಸುಸ್ಥಿರ ಅಭ್ಯಾಸಗಳನ್ನು ಸಂಯೋಜಿಸುತ್ತದೆ.",
        growth_metrics: "ಬೆಳವಣಿಗೆ ಮೆಟ್ರಿಕ್ಸ್",
        growth_metrics_desc: "ನಮ್ಮ ಪರಿಹಾರಗಳು ಪ್ರಮುಖ ಕೃಷಿ ಮೆಟ್ರಿಕ್ಸ್‌ಗಳಲ್ಲಿ ಗಮನಾರ್ಹ ಸುಧಾರಣೆಗಳನ್ನು ಸ್ಥಿರವಾಗಿ ತೋರಿಸಿವೆ, ಇದು ಬೆಳೆ ಇಳುವರಿ, ಸಂಪನ್ಮೂಲ ದಕ್ಷತೆ, ಮತ್ತು ಒಟ್ಟಾರೆ ಫಾರ್ಮ್ ಉತ್ಪಾದಕತೆಯಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ಉತ್ತಮ ಪ್ರದರ್ಶನವನ್ನು ತೋರಿಸುತ್ತದೆ."
    }
};

// Function to update page content with translations
function updateContent(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}

// Initialize translations
document.addEventListener('DOMContentLoaded', function() {
    const languageDropdown = document.getElementById('languageDropdown');
    if (languageDropdown) {
        const savedLang = localStorage.getItem('language') || 'en';
        languageDropdown.value = savedLang;
        updateContent(savedLang);

        languageDropdown.addEventListener('change', function() {
            const selectedLang = this.value;
            localStorage.setItem('language', selectedLang);
            updateContent(selectedLang);
        });
    }
}); 