// Comprehensive Syllabus Database
// Sources: shaalaa.com (Balbharati, NCERT, Selina), maharashtrastudy.com, selfstudys.com
// Structure: board → class → subject → chapters[]

export const SYLLABUS_DB: Record<string, any> = {
    // ═══════════════════════════════════════════════════════════════
    // MAHARASHTRA STATE BOARD (SSC) — Balbharati Textbooks
    // ═══════════════════════════════════════════════════════════════
    "maharashtra": {
        "1": {
            "Mathematics": ["Numbers 1 to 100", "Addition", "Subtraction", "Numbers 100 to 999", "Measurement", "Time", "Money", "Shapes"],
            "English": ["My Family", "Animals Around Us", "Our School", "Festivals", "My Body", "Good Habits", "Transport", "Seasons"],
            "EVS (परिसर अभ्यास)": ["My Family", "My School", "Our Body", "Food", "Animals", "Plants", "Festivals", "Transport", "Safety Rules"]
        },
        "2": {
            "Mathematics": ["Numbers up to 999", "Addition and Subtraction", "Multiplication", "Shapes and Patterns", "Measurement", "Time", "Money", "Data Handling"],
            "English": ["My Neighbourhood", "Helpers Around Us", "Our Environment", "Stories", "Poems", "Seasons", "Festivals", "Health and Hygiene"],
            "EVS (परिसर अभ्यास)": ["My Family and Friends", "Animals and Birds", "Plants and Trees", "Water", "Air", "Food", "Shelter", "Safety and First Aid"]
        },
        "3": {
            "Mathematics": ["Numbers up to 9999", "Addition and Subtraction", "Multiplication and Division", "Fractions", "Measurement", "Time", "Money", "Shapes and Patterns", "Data Handling"],
            "English": ["Prose", "Poetry", "Grammar", "Writing Skills", "Reading Comprehension"],
            "EVS (परिसर अभ्यास)": ["Living Things", "Non-Living Things", "Our Body", "Food and Nutrition", "Water", "Shelter", "Clothes", "Transport and Communication", "Our Helpers"]
        },
        "4": {
            "Mathematics": ["Numbers up to 99999", "Addition and Subtraction", "Multiplication and Division", "Fractions", "Decimals", "Measurement", "Time", "Money", "Geometry", "Data Handling"],
            "English": ["Prose", "Poetry", "Grammar", "Writing Skills", "Reading Comprehension"],
            "EVS (परिसर अभ्यास)": ["Living World", "Our Environment", "Our Body Systems", "Food and Agriculture", "Natural Resources", "Transport and Communication", "Our State Maharashtra"]
        },
        "5": {
            "Mathematics": ["Large Numbers", "Roman Numerals", "HCF and LCM", "Fractions", "Decimals", "Measurement (Length, Weight, Capacity)", "Area and Perimeter", "Percentage", "Profit and Loss", "Data Handling", "Geometry"],
            "English": ["Prose", "Poetry", "Grammar (Tenses, Parts of Speech)", "Writing Skills (Letter, Essay, Paragraph)", "Reading Comprehension"],
            "General Science": ["Living World", "Human Body", "Food and Nutrition", "Natural Resources", "Materials", "Simple Machines", "Environment", "Disaster Management"],
            "History and Civics": ["Our Past", "Ancient Civilizations", "Medieval Period", "India Before Independence", "Our Constitution"],
            "Geography": ["Our Earth", "Maps", "Weather and Climate", "Natural Resources", "Maharashtra Geography"]
        },
        "6": {
            "Mathematics": ["Integers", "Fractions and Decimals", "Ratio and Proportion", "Algebra – Introduction", "Geometry – Basic Concepts", "Angles", "Symmetry", "Mensuration – Perimeter and Area", "Data Handling"],
            "General Science": ["Natural Resources – Air, Water and Land", "The Living World", "Diversity in Living Things", "Disaster Management", "Substances in Daily Use", "Nutrition and Diet", "Our Skeletal System and the Skin", "Motion and Types of Motion", "Force and Types of Force", "Simple Machines", "Work and Energy", "Sound", "Light and Shadow", "Fun with Magnets", "Information Communication Technology (ICT)"],
            "History and Civics": ["What is History and Why?", "The Indian Subcontinent and History", "The Harappan Civilization", "The Vedic Civilization", "Religious Trends in Ancient India", "Janapadas and Mahajanapadas", "India during the Maurya Period", "State and Government", "Features of the Constitution", "Panchayati Raj"],
            "Geography": ["The Earth and the Graticule", "Let Us Use the Globe", "Seasons", "The Atmosphere", "Weathering", "Rocks and Rock Types", "Internal Movements of the Earth", "Human Settlements"],
            "English": ["Prose", "Poetry", "Grammar", "Writing Skills", "Reading Comprehension"]
        },
        "7": {
            "Mathematics": ["Geometrical Constructions", "Multiplication and Division of Integers", "HCF and LCM", "Angles and Pairs of Angles", "Operations on Rational Numbers", "Indices", "Joint Bar Graph", "Algebraic Expressions and Operations", "Equations in One Variable", "Properties of Triangles", "Circle", "Perimeter and Area", "Pythagoras' Theorem", "Symmetry"],
            "General Science": ["Plants – Structure and Function", "Plants – Growth", "Properties of Natural Resources", "Nutrition in Living Organisms", "Food Safety", "Measurement of Physical Quantities", "Motion, Force and Work", "Static Electricity", "Heat", "Acids, Bases and Salts", "Classification of Organisms", "The Universe", "Sound", "Properties of Lenses"],
            "History and Civics": ["Sources of History", "India before the Times of Shivaji Maharaj", "Features of the Constitution (contd.)", "Fundamental Rights Part I & II", "Directive Principles", "Expansion of the Maratha Power", "The Marathas and the Mughals", "The Advent of Europeans in India", "British Expansion in India", "Administration, Revenue and Judicial Systems"],
            "Geography": ["Tools for Study of Geography", "India: Location and Extent", "India: Physical Divisions", "India: Climate", "India: Natural Vegetation", "India: Water Resources", "India: Agriculture", "Population"],
            "English": ["Prose", "Poetry", "Grammar", "Writing Skills", "Reading Comprehension"]
        },
        "8": {
            "Mathematics": ["Rational and Irrational Numbers", "Parallel Lines and Transversals", "Indices and Cube Root", "Altitudes and Medians of a Triangle", "Expansion Formulae", "Factorisation of Algebraic Expressions", "Variation", "Quadrilateral: Constructions and Types", "Discount and Commission", "Division of Polynomials", "Statistics", "Equations in One Variable", "Congruence of Triangles", "Compound Interest", "Area", "Surface Area and Volume", "Circle: Arc and Chord"],
            "General Science": ["Living World and Classification of Microbes", "Health and Diseases", "Force and Pressure", "Current Electricity and Magnetism", "Inside the Atom", "Composition of Matter", "Combustion, Flame and Fuel", "Pollution", "Disaster Management", "Cell and Cell Organelles", "Human Body and Organ System", "Introduction to Acid and Base", "Chemical Change and Chemical Bond", "Measurement and Effects of Heat", "Sound", "Reflection of Light", "Man-made Materials", "Ecosystems"],
            "History and Civics": ["Sources of Cultural History", "Arts and Literature During Medieval Period", "India and the Modern World", "The French Revolution", "The Industrial Revolution", "Urbanisation", "The First War of Indian Independence", "Struggle for Equality", "Indian Constitution – Formation and Concepts", "Fundamental Rights and Duties", "Directive Principles", "The Indian Judiciary"],
            "Geography": ["Local Time and Standard Time", "Rotation and Revolution of the Earth", "Pressure Belts and Types of Winds", "Volcanoes and Earthquakes", "Rocks and Rock Types", "Internal Processes of the Earth", "Weather and Climate", "India: Introduction, Physical Divisions", "Agriculture in India", "Industries in India", "Transport and Communication"],
            "English": ["Prose", "Poetry", "Grammar", "Writing Skills", "Reading Comprehension"]
        },
        "9": {
            "Mathematics Part-I (Algebra)": ["Sets", "Real Numbers", "Polynomials", "Ratio and Proportion", "Linear Equations in Two Variables", "Financial Planning", "Statistics"],
            "Mathematics Part-II (Geometry)": ["Basic Concepts in Geometry", "Parallel Lines", "Triangles", "Construction of Triangles", "Quadrilaterals", "Circle", "Coordinate Geometry", "Trigonometry", "Surface Area and Volume"],
            "Science and Technology Part-1": ["Laws of Motion", "Work and Energy", "Current Electricity", "Measurement of Matter", "Acids, Bases and Salts", "Reflection of Light", "Study of Sound", "Carbon: An Important Element", "Substances in Common Use"],
            "Science and Technology Part-2": ["Classification of Plants", "Energy Flow in an Ecosystem", "Useful and Harmful Microbes", "Environmental Management", "Life Processes in Living Organisms", "Heredity and Variation", "Introduction to Biotechnology", "Observing Space: Telescopes"],
            "History and Political Science": ["Sources of History", "India: Events after 1960", "India's Internal Challenges", "Economic Development", "Education", "Empowerment of Women and other Weaker Sections", "Science and Technology", "Industry and Trade", "Changing Life: 1", "Changing Life: 2", "Post-World War Political Developments", "India's Foreign Policy", "India's Defence System", "The United Nations", "India and Other Nations", "International Problems"],
            "Geography": ["Distributional Maps", "Endogenetic Movements", "Exogenetic Movements Part-1", "Exogenetic Movements Part-2", "Precipitation", "Properties of Sea Water", "International Date Line", "Introduction to Economics", "Trade", "Urbanisation", "Transport and Communication", "Tourism"]
        },
        "10": {
            "Mathematics Part-I (Algebra)": ["Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progression", "Financial Planning", "Probability", "Statistics"],
            "Mathematics Part-II (Geometry)": ["Similarity", "Pythagoras Theorem", "Circle", "Geometric Constructions", "Coordinate Geometry", "Trigonometry", "Mensuration"],
            "Science and Technology Part-1": ["Gravitation", "Periodic Classification of Elements", "Chemical Reactions and Equations", "Effects of Electric Current", "Heat", "Refraction of Light", "Lenses", "Metallurgy", "Carbon Compounds", "Space Missions"],
            "Science and Technology Part-2": ["Heredity and Evolution", "Life Processes in Living Organisms Part-1", "Life Processes in Living Organisms Part-2", "Environmental Management", "Towards Green Energy", "Animal Classification", "Introduction to Microbiology", "Cell Biology and Biotechnology", "Social Health", "Disaster Management"],
            "History and Political Science": ["Historiography: Development in the West", "Historiography: Indian Tradition", "Applied History", "History of Indian Arts", "Mass Media and History", "Entertainment and History", "Sports and History", "Tourism and History", "Heritage Management", "Working of the Constitution", "The Electoral Process", "Political Parties", "Social and Political Movements", "Challenges faced by Indian Democracy"],
            "Geography": ["Location and Extent", "Physiography and Drainage", "Climate", "Natural Vegetation and Wildlife", "Population", "Human Settlements", "Economy and Occupations", "Tourism, Transport and Communication"]
        },
        "11": {
            "Mathematics and Statistics Part-I": ["Complex Numbers", "Sequences and Series", "Permutations and Combinations", "Methods of Induction and Binomial Theorem", "Sets and Relations", "Functions", "Limits", "Continuity", "Differentiation"],
            "Mathematics and Statistics Part-II": ["Measurement of Angles", "Trigonometric Functions", "Trigonometric Functions of Compound Angles", "Factorization Formulae", "Locus and Straight Line", "Circle", "Conic Sections", "Measures of Dispersion", "Probability"],
            "Physics": ["Units and Measurements", "Mathematical Methods", "Motion in a Straight Line", "Laws of Motion", "Friction in Solids and Liquids", "Sound Waves", "Thermal Properties of Matter", "Refraction of Light", "Ray Optics", "Electrostatics", "Electric Current Through Conductors", "Magnetism", "Electromagnetic Waves and Communication System"],
            "Chemistry": ["Some Basic Concepts of Chemistry", "Introduction to Analytical Chemistry", "Basic Analytical Techniques", "Structure of Atom", "Chemical Bonding", "Redox Reactions", "Modern Periodic Table", "Elements of Group 1 and 2", "Elements of Group 13, 14 and 15", "States of Matter", "Adsorption and Colloids", "Chemical Equilibrium", "Nuclear Chemistry and Radioactivity", "Basic Principles of Organic Chemistry", "Hydrocarbons", "Chemistry in Everyday Life"],
            "Biology": ["Living World", "Systematics of Living Organisms", "Kingdom Plantae", "Kingdom Animalia", "Cell Structure and Organization", "Biomolecules", "Cell Division", "Plant Tissues and Anatomy", "Morphology of Flowering Plants", "Animal Tissue", "Study of Animal Type", "Human Nutrition", "Human Respiration", "Human Skeleton and Locomotion"],
            "English": ["Prose", "Poetry", "Grammar", "Writing Skills", "Literary Appreciation"],
            "Economics": ["Introduction to Micro and Macro Economics", "Consumers' Behaviour", "Analysis of Supply", "Forms of Market", "Indian Economy", "Agriculture", "Industry", "Services Sector"],
            "History": ["Historiography", "Sources of History", "Human Evolution", "Vedic Period", "Religious Literature", "Arts in Ancient India", "Old Stone Age to the Metal Age", "Ancient Indian Architecture"],
            "Geography": ["Geography as a Discipline", "The Earth", "Landforms", "Atmospheric Composition and Structure", "Insolation", "Atmospheric Pressure and Wind", "Atmospheric Moisture", "Water on the Earth", "Biosphere"]
        },
        "12": {
            "Mathematics and Statistics Part-I": ["Mathematical Logic", "Matrices", "Trigonometric Functions", "Pair of Straight Lines", "Vectors", "Three Dimensional Geometry", "Line", "Plane", "Linear Programming"],
            "Mathematics and Statistics Part-II": ["Differentiation", "Applications of Derivatives", "Indefinite Integration", "Definite Integration", "Application of Definite Integration", "Differential Equations", "Probability Distributions", "Binomial Distribution"],
            "Physics": ["Rotational Dynamics", "Mechanical Properties of Fluids", "Kinetic Theory of Gases and Radiation", "Thermodynamics", "Oscillations", "Superposition of Waves", "Wave Optics", "Electrostatics", "Current Electricity", "Magnetic Fields due to Electric Current", "Magnetic Materials", "Electromagnetic Induction", "AC Circuits", "Dual Nature of Radiation and Matter", "Structure of Atoms and Nuclei", "Semiconductor Devices"],
            "Chemistry": ["Solid State", "Solutions", "Ionic Equilibria", "Chemical Thermodynamics", "Electrochemistry", "Chemical Kinetics", "Elements of Groups 16, 17 and 18", "Transition and Inner Transition Elements", "Coordination Compounds", "Halogen Derivatives of Alkanes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
            "Biology": ["Reproduction in Lower and Higher Plants", "Reproduction in Lower and Higher Animals", "Inheritance and Variation", "Molecular Basis of Inheritance", "Origin and Evolution of Life", "Plant Water Relations", "Plant Growth and Mineral Nutrition", "Respiration and Circulation", "Control and Coordination", "Human Health and Diseases", "Enhancement of Food Production", "Biotechnology", "Organisms and Populations", "Ecosystems and Energy Flow", "Biodiversity, Conservation and Environmental Issues"],
            "English": ["Prose", "Poetry", "Grammar and Composition", "Writing Skills", "Literary Appreciation"],
            "Economics": ["National Income", "Government Budget", "Money Market and Capital Market", "Foreign Trade", "Balance of Payments", "Public Revenue and Expenditure"],
            "History": ["Cold War", "Colonialism in Asia and Africa", "Decolonization", "World Since 1945 – I", "World Since 1945 – II", "India Since Independence"],
            "Geography": ["Population Geography", "Migration", "Human Development", "Economic Activities", "Primary Activities", "Secondary Activities", "Tertiary Activities", "Transport and Communication"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // CBSE — NCERT Textbooks  
    // ═══════════════════════════════════════════════════════════════
    "cbse": {
        "1": {
            "Mathematics": ["Shapes and Space", "Numbers from One to Nine", "Addition", "Subtraction", "Numbers from Ten to Twenty", "Time", "Measurement", "Numbers from Twenty-one to Fifty", "Data Handling", "Patterns", "Money", "How Many"],
            "English": ["A Happy Child", "Three Little Pigs", "After a Bath", "The Bubble, the Straw and the Shoe", "One Little Kitten", "Lalu and Peelu", "Once I Saw a Little Bird", "Mittu and the Yellow Mango", "Merry-Go-Round", "Circle", "If I Were an Apple", "Our Tree", "A Kite", "Sundari", "A Little Turtle", "The Tiger and the Mosquito", "Clouds", "Anandi's Rainbow", "Flying Man", "The Tailor and his Friend"],
            "EVS": ["My Family", "My School", "My Body", "Food We Eat", "Animals Around Us", "Plants Around Us", "Clothes We Wear", "Houses We Live In", "Festivals We Celebrate", "Safety Rules"],
            "Hindi": ["झूला", "आम की कहानी", "आम की टोकरी", "पत्ते ही पत्ते", "पकौड़ी", "छुक-छुक गाड़ी", "रसोईघर", "चूहो! म्याऊँ सो रही है", "बंदर और गिलहरी", "पगड़ी", "पतंग", "गेंद-बल्ला", "बंदर गया खेत में भाग", "एक बुढ़िया", "मैं भी", "लालू और पीलू", "चकई के चकदुम", "छोटी का कमाल", "चार चने", "भगदड़", "हलीम चला चाँद पर", "हाथी चल्लम चल्लम", "सात पूँछ का चूहा"]
        },
        "2": {
            "Mathematics": ["What is Long, What is Round?", "Counting in Groups", "How Much Can You Carry?", "Counting in Tens", "Patterns", "Footprints", "Jugs and Mugs", "Tens and Ones", "My Funday", "Add Our Points", "Lines and Lines", "Give and Take", "The Longest Step", "Birds Come, Birds Go", "How Many Ponytails?"],
            "English": ["First Day at School", "Haldi's Adventure", "I am Lucky!", "I Want", "A Smile", "The Wind and the Sun", "Rain", "Storm in the Garden", "Zoo Manners", "Funny Bunny", "Mr. Nobody", "Curlylocks and the Three Bears", "On My Blackboard I can Draw", "Make it Shorter", "I am the Music Man", "The Mumbai Musicians", "Granny Granny Please Comb my Hair", "The Magic Porridge Pot", "Strange Talk", "The Grasshopper and the Ant"],
            "EVS": ["More About Myself", "My Body", "Types of Families", "Services in the Neighbourhood", "People Who Help Us", "Festivals and Celebrations", "Food We Eat", "Clothes We Wear", "Types of Houses", "Plants Around Us", "Animals Around Us", "Means of Transport", "Communication", "Safety Rules"],
            "Hindi": ["ऊँट चला", "भालू ने खेली फुटबॉल", "म्याऊँ, म्याऊँ!!", "अधिक बलवान कौन?", "दोस्त की मदद", "बहुत हुआ", "मेरी किताब", "तितली और कली", "बुलबुल", "मीठी सारंगी", "टेसू राजा बीच बाज़ार", "बस के नीचे बाघ", "सूरज जल्दी आना जी", "नटखट चूहा", "एक्की-दोक्की"]
        },
        "3": {
            "Mathematics": ["Where to Look From", "Fun with Numbers", "Give and Take", "Long and Short", "Shapes and Designs", "Fun with Give and Take", "Time Goes On", "Who is Heavier?", "How Many Times?", "Play with Patterns", "Jugs and Mugs", "Can We Share?", "Smart Charts!", "Rupees and Paise"],
            "English": ["Good Morning", "The Magic Garden", "Bird Talk", "Nina and the Baby Sparrows", "Little by Little", "The Enormous Turnip", "Sea Song", "A Little Fish Story", "The Balloon Man", "The Yellow Butterfly", "Trains", "The Story of the Road", "Puppy and I", "Little Tiger, Big Tiger", "What's in the Mailbox?", "My Silly Sister", "Don't Tell", "He is My Brother", "How Creatures Move", "The Ship of the Desert"],
            "EVS": ["Poonam's Day Out", "The Plant Fairy", "Water O' Water!", "Our First School", "Chhotu's House", "Foods We Eat", "Saying Without Speaking", "Flying High", "It's Raining", "What is Cooking?", "From Here to There", "Work We Do", "Sharing Our Feelings", "The Story of Food", "Making Pots", "Games We Play", "Here comes a Letter", "A House Like This!", "Our Friends - Animals", "Drop by Drop", "Families can be Different", "Left-Right", "A Beautiful Cloth", "Web of Life"],
            "Hindi": ["कक्कू", "शेखीबाज़ मक्खी", "चाँद वाली अम्मा", "मन करता है", "बहादुर बित्तो", "हमसे सब कहते", "टिपटिपवा", "बंदर - बाँट", "कब आऊ", "क्योंजीमल और कैसे कैसलिया", "मीरा बहन और बाघ", "जब मुझको साँप ने काटा", "मिर्च का मज़ा", "सबसे अच्छा पेड़"]
        },
        "4": {
            "Mathematics": ["Building with Bricks", "Long and Short", "A Trip to Bhopal", "Tick-Tick-Tick", "The Way the World Looks", "The Junk Seller", "Jugs and Mugs", "Carts and Wheels", "Halves and Quarters", "Play with Patterns", "Tables and Shares", "How Heavy? How Light?", "Fields and Fences", "Smart Charts"],
            "English": ["Wake Up!", "Neha's Alarm Clock", "Noses", "The Little Fir Tree", "Run!", "Nasruddin's Aim", "Why?", "Alice in Wonderland", "Don't be Afraid of the Dark", "Helen Keller", "The Donkey", "I Had a Little Pony", "The Milkman's Cow", "Hiawatha", "The Scholar's Mother Tongue", "A Watering Rhyme", "The Giving Tree", "The Donkey (Poem)", "Books", "Going to Buy a Book", "The Naughty Boy", "Pinocchio"],
            "EVS": ["Going to School", "Ear to Ear", "A Day with Nandu", "The Story of Amrita", "Anita and the Honeybees", "Omana's Journey", "From the Window", "Reaching Grandmother's House", "Changing Families", "Hu Tu Tu, Hu Tu Tu", "The Valley of Flowers", "Changing Times", "A River's Tale", "Basva's Farm", "From Market to Home", "A Busy Month", "Nandita in Mumbai", "Too Much Water, Too Little Water", "Abdul in the Garden", "Eating Together", "Food and Fun", "The World in my Home", "Pochampalli", "Home and Abroad", "Spicy Riddles", "Defence Officer: Wahida", "Chuskit Goes to School"],
            "Hindi": ["मन के भोले-भाले बादल", "जैसा सवाल वैसा जवाब", "किरमिच की गेंद", "पापा जब बच्चे थे", "दोस्त की पोशाक", "नाव बनाओ नाव बनाओ", "दान का हिसाब", "कौन?", "स्वतंत्रता की ओर", "थप्प रोटी थप्प दाल", "पढ़क्‍कू की सूझ", "सुनीता की पहिया कुर्सी", "हुदहुद", "मुफ्त ही मुफ्त"]
        },
        "5": {
            "Mathematics": ["The Fish Tale", "Shapes and Angles", "How Many Squares?", "Parts and Wholes", "Does it Look the Same?", "Be My Multiple, I'll be Your Factor", "Can You See the Pattern?", "Mapping Your Way", "Boxes and Sketches", "Tenths and Hundredths", "Area and its Boundary", "Smart Charts", "Ways to Multiply and Divide", "How Big? How Heavy?"],
            "English": ["Ice-cream Man", "Wonderful Waste!", "Teamwork", "Flying Together", "My Shadow", "Robinson Crusoe Discovers a Footprint", "Crying", "My Elder Brother", "The Lazy Frog", "Rip Van Winkle", "Class Discussion", "The Talkative Barber", "Topsy-turvy Land", "Gulliver's Travels", "Nobody's Friend", "The Little Bully", "Sing a Song of People", "Around the World", "Malu Bhalu", "Who Will be Ningthou?"],
            "EVS": ["Super Senses", "A Snake Charmer's Story", "From Tasting to Digesting", "Mangoes Round the Year", "Seeds and Seeds", "Every Drop Counts", "Experiments with Water", "A Treat for Mosquitoes", "Up You Go!", "Walls Tell Stories", "Sunita in Space", "What if it Finishes...?", "A Shelter so High!", "When the Earth Shook!", "Blow Hot, Blow Cold", "Who will do this Work?", "Across the Wall", "No Place for Us?", "A Seed tells a Farmer's Story", "Whose Forests?", "Like Father, Like Daughter", "On the Move Again"],
            "Hindi": ["राख की रस्सी", "फसलों का त्योहार", "खिलौनेवाला", "नन्हा फनकार", "जहाँ चाह वहाँ राह", "चिट्ठी का सफर", "डाकिए की कहानी, कँवरसिंह की जुबानी", "वे दिन भी क्या दिन थे", "एक माँ की बेबसी", "एक दिन की बादशाहत", "चावल की रोटियाँ", "गुरु और चेला", "स्वामी की दादी", "बाघ आया उस रात", "बिशन की दिलेरी", "पानी रे पानी", "छोटी सी हमारी नदी", "चुनौती हिमालय की"]
        },
        "6": {
            "Mathematics": ["Knowing Our Numbers", "Whole Numbers", "Playing with Numbers", "Basic Geometrical Ideas", "Understanding Elementary Shapes", "Integers", "Fractions", "Decimals", "Data Handling", "Mensuration", "Algebra", "Ratio and Proportion"],
            "Science": ["Components of Food", "Sorting Materials into Groups", "Separation of Substances", "Getting to Know Plants", "Body Movements", "The Living Organisms and Their Surroundings", "Motion and Measurement of Distances", "Light, Shadows and Reflections", "Electricity and Circuits", "Fun with Magnets", "Air Around Us"],
            "Social Science (History)": ["What Where, How and When?", "From Hunting-Gathering to Growing Food", "In the Earliest Cities", "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas", "From a Kingdom to an Empire", "Villages, Towns and Trade", "New Empires and Kingdoms", "Buildings, Paintings and Books"],
            "Social Science (Geography)": ["The Earth in the Solar System", "Globe: Latitudes and Longitudes", "Motions of the Earth", "Maps", "Major Domains of the Earth", "Our Country - India"],
            "Social Science (Civics)": ["Understanding Diversity", "Diversity and Discrimination", "What is Government?", "Panchayati Raj", "Rural Administration", "Urban Administration", "Rural Livelihoods", "Urban Livelihoods"],
            "English": ["Who Did Patrick's Homework?", "How the Dog Found Himself a New Master!", "Taro's Reward", "An Indian-American Woman in Space: Kalpana Chawla", "A Different Kind of School", "Who I Am", "Fair Play", "The Banyan Tree"],
            "Hindi": ["वह चिड़िया जो", "बचपन", "नादान दोस्त", "चाँद से थोड़ी-सी गप्पें", "अक्षरों का महत्त्व", "पार नज़र के", "साथी हाथ बढ़ाना", "ऐसे-ऐसे", "टिकट अलबम", "झाँसी की रानी", "जो देखकर भी नहीं देखते", "संसार पुस्तक है", "मैं सबसे छोटी होऊँ", "लोकगीत", "नौकर", "वन के मार्ग में"]
        },
        "7": {
            "Mathematics": ["Integers", "Fractions and Decimals", "Data Handling", "Simple Equations", "Lines and Angles", "The Triangle and its Properties", "Comparing Quantities", "Rational Numbers", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers", "Symmetry", "Visualising Solid Shapes"],
            "Science": ["Nutrition in Plants", "Nutrition in Animals", "Heat", "Acids, Bases and Salts", "Physical and Chemical Changes", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and its Effects", "Light", "Forests: Our Lifeline", "Wastewater Story"],
            "Social Science (History)": ["Tracing Changes Through a Thousand Years", "New Kings and Kingdoms", "The Delhi Sultans", "The Mughal Empire", "Tribes, Nomads and Settled Communities", "Devotional Paths to the Divine", "The Making of Regional Cultures", "Eighteenth-Century Political Formations"],
            "Social Science (Geography)": ["Environment", "Inside Our Earth", "Our Changing Earth", "Air", "Water", "Human Environment Interactions - The Tropical and the Subtropical Region", "Life in the Deserts"],
            "Social Science (Civics)": ["On Equality", "Role of the Government in Health", "How the State Government Works", "Growing up as Boys and Girls", "Women Change the World", "Understanding Media", "Markets Around Us", "A Shirt in the Market"],
            "English": ["Three Questions", "A Gift of Chappals", "Gopal and the Hilsa Fish", "The Ashes That Made Trees Bloom", "Quality", "Expert Detectives", "The Invention of Vita-Wonk", "A Homage to Our Brave Soldiers"],
            "Hindi": ["हम पंछी उन्मुक्त गगन के", "दादी माँ", "हिमालय की बेटियाँ", "कठपुतली", "मिठाईवाला", "रक्त और हमारा शरीर", "पापा खो गए", "शाम-एक किसान", "चिड़िया की बच्ची", "अपूर्व अनुभव", "रहीम के दोहे", "कंचा", "एक तिनका", "खानपान की बदलती तस्वीर", "नीलकंठ", "भोर और बरखा", "वीर कुँवर सिंह", "संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज", "आश्रम का अनुमानित व्यय", "विप्लव गायन"]
        },
        "8": {
            "Mathematics": ["Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Data Handling", "Squares and Square Roots", "Cubes and Cube Roots", "Comparing Quantities", "Algebraic Expressions and Identities", "Mensuration", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs"],
            "Science": ["Crop Production and Management", "Microorganisms: Friend and Foe", "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals", "Reproduction in Animals", "Reaching the Age of Adolescence", "Force and Pressure", "Friction", "Sound", "Chemical Effects of Electric Current", "Some Natural Phenomena", "Light"],
            "Social Science (History)": ["How, When and Where", "From Trade to Territory", "Ruling the Countryside", "Tribals, Dikus and the Vision of a Golden Age", "When People Rebel", "Civilising the 'Native', Educating the Nation", "Women, Caste and Reform", "The Making of the National Movement: 1870s-1947"],
            "Social Science (Geography)": ["Resources", "Land, Soil, Water, Natural Vegetation and Wildlife Resources", "Agriculture", "Industries", "Human Resources"],
            "Social Science (Civics)": ["The Indian Constitution", "Understanding Secularism", "Why Do We Need a Parliament", "Understanding Laws", "Judiciary", "Understanding Our Criminal Justice System", "Understanding Marginalisation", "Confronting Marginalisation", "Public Facilities", "Law and Social Justice"],
            "English": ["The Best Christmas Present in the World", "The Tsunami", "Glimpses of the Past", "Bepin Choudhury's Lapse of Memory", "The Summit Within", "This is Jody's Fawn", "A Visit to Cambridge", "A Short Monsoon Diary"],
            "Hindi": ["ध्वनि", "लाख की चूिड़या", "बस की यात्रा", "दीवानों की हस्ती", "चिट्ठियों की अनूठी दुनिया", "भगवान के डाकिए", "क्या निराश हुआ जाए", "यह सबसे कठिन समय नहीं", "कबीर की साखियाँ", "कामचोर", "जब सिनेमा ने बोलना सीखा", "सुदामा चरित", "जहाँ पहिया है", "अकबरी लोटा", "सूर के पद", "पानी की कहानी", "बाज और साँप", "टोपी"]
        },
        "9": {
            "Mathematics": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Heron's Formula", "Surface Areas and Volumes", "Statistics"],
            "Science": ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom", "The Fundamental Unit of Life", "Tissues", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Improvement in Food Resources"],
            "Social Science (History)": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World"],
            "Social Science (Geography)": ["India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population"],
            "Social Science (Civics)": ["What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "Democratic Rights"],
            "Social Science (Economics)": ["The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"],
            "English": ["The Fun They Had", "The Sound of Music", "The Little Girl", "A Truly Beautiful Mind", "The Snake and the Mirror", "My Childhood", "Reach for the Top", "Kathmandu", "If I Were You"],
            "Hindi": ["दो बैलों की कथा", "ल्हासा की ओर", "उपभोक्तावाद की संस्कृति", "साँवले सपनों की याद", "प्रेमचंद के फटे जूते", "मेरे बचपन के दिन", "साखियाँ एवं सबद", "वाख", "सवैये", "कैदी और कोकिला", "ग्राम श्री", "मेघ आए", "बच्चे काम पर जा रहे हैं", "इस जल प्रलय में", "मेरे संग की औरतें", "रीढ़ की हड्डी"]
        },
        "10": {
            "Mathematics": ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"],
            "Science": ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity", "Light - Reflection and Refraction", "The Human Eye and the Colorful World", "Electricity", "Magnetic Effects of Electric Current", "Our Environment"],
            "Social Science (History)": ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World"],
            "Social Science (Geography)": ["Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of National Economy"],
            "Social Science (Civics)": ["Power Sharing", "Federalism", "Gender, Religion and Caste", "Political Parties", "Outcomes of Democracy"],
            "Social Science (Economics)": ["Development", "Sectors of the Indian Economy", "Money and Credit", "Globalization and the Indian Economy"],
            "English": ["A Letter to God", "Nelson Mandela: Long Walk to Freedom", "Two Stories about Flying", "From the Diary of Anne Frank", "Glimpses of India", "Mijbil the Otter", "Madam Rides the Bus", "The Sermon at Benares", "The Proposal"],
            "Hindi": ["सूरदास", "तुलसीदास", "देव", "जयशंकर प्रसाद", "सूर्यकांत त्रिपाठी 'निराला'", "नागार्जुन", "गिरिजा कुमार माथुर", "ऋतुराज", "मंगलेश डबराल", "स्वयं प्रकाश", "रामवृक्ष बेनीपुरी", "यशपाल", "सर्वेश्वर दयाल सक्सेना", "मन्नू भंडारी", "महावीर प्रसाद द्विवेदी", "यतीन्द्र मिश्रा", "भदंत आनंद कौसल्यायन", "माता का अँचल", "जॉर्ज पंचम की नाक", "साना – साना हाथ जोड़ि…", "एही ठैयाँ झुलनी हेरानी हो रामा!", "मैं क्यों लिखता हूँ?"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ICSE — Selina / Frank Textbooks
    // ═══════════════════════════════════════════════════════════════
    "icse": {
        "1": {
            "Mathematics": ["Numbers 1 to 100", "Addition", "Subtraction", "Shapes", "Measurement", "Time", "Money", "Patterns"],
            "English": ["Prose", "Poetry", "Grammar (Nouns, Verbs, Adjectives)", "Handwriting", "Reading Comprehension"],
            "EVS": ["My Family", "My Body", "Food", "Animals", "Plants", "Clothes", "Shelter", "Water"]
        },
        "2": {
            "Mathematics": ["Numbers up to 999", "Addition and Subtraction", "Multiplication", "Shapes", "Measurement", "Time", "Money", "Data Handling"],
            "English": ["Prose", "Poetry", "Grammar (Tenses, Pronouns)", "Comprehension", "Writing"],
            "EVS": ["My Neighbourhood", "Animals and Plants", "Water and Air", "Our Body", "Food and Health", "Safety"]
        },
        "3": {
            "Mathematics": ["Numbers up to 9999", "Addition and Subtraction", "Multiplication and Division", "Fractions", "Measurement", "Time", "Money", "Geometry", "Patterns", "Data Handling"],
            "English": ["Prose", "Poetry", "Grammar", "Comprehension", "Composition"],
            "EVS": ["Living and Non-Living Things", "Plants", "Animals", "Our Body", "Food and Health", "Water and Air", "Soil and Rocks", "Transport and Communication"]
        },
        "4": {
            "Mathematics": ["Numbers Beyond 9999", "Number Operations", "Factors and Multiples", "Fractions and Decimals", "Measurement", "Geometry", "Perimeter and Area", "Time", "Money", "Data Handling"],
            "English": ["Prose", "Poetry", "Grammar", "Comprehension", "Creative Writing"],
            "EVS": ["The Green World", "The Animal World", "Our Body and Health", "Food and Nutrition", "Soil and Rocks", "Earth and Universe", "Environment"]
        },
        "5": {
            "Mathematics": ["Numbers and Number Names", "Operations on Large Numbers", "HCF and LCM", "Fractions", "Decimals", "Measurement", "Perimeter and Area", "Volume", "Geometry", "Percentage", "Speed, Distance and Time", "Data Handling"],
            "English": ["Prose", "Poetry", "Grammar (Parts of Speech, Tenses, Active-Passive)", "Composition (Essay, Letter, Story)", "Comprehension"],
            "EVS / Science": ["Plants", "Animals", "Human Body", "Food and Nutrition", "Earth and Universe", "Matter and Materials", "Energy", "Environment and Pollution"]
        },
        "6": {
            "Mathematics": ["Number System", "Estimation", "Numbers in India and International System", "HCF and LCM", "Fractions", "Decimals", "Ratio and Proportion", "Algebra – Introduction and Simple Equations", "Geometry – Basic Concepts", "Angles", "Symmetry", "Mensuration – Perimeter and Area", "Data Handling"],
            "Physics": ["Physical Quantities and Measurement", "Light", "Magnetism", "Electricity", "Heat", "Force and Motion"],
            "Chemistry": ["Introduction to Chemistry", "Elements, Compounds and Mixtures", "Water", "Air and Atmosphere", "Matter"],
            "Biology": ["The Cell", "Plant Life", "Animal Life", "Human Body – Food and Digestion", "Health and Hygiene", "Habitat and Adaptation"],
            "History and Civics": ["Studying History", "The River Valley Civilizations", "The Vedic Age", "Buddhism and Jainism", "The Mauryan Empire", "Our Constitution – Preamble", "Fundamental Rights and Duties"],
            "Geography": ["The Earth and the Solar System", "Geographic Grid: Latitudes and Longitudes", "Rotation and Revolution", "Structure of the Earth", "Weathering", "Rocks", "Volcanoes and Earthquakes", "Maps"],
            "English": ["Prose", "Poetry", "Grammar", "Composition", "Comprehension"]
        },
        "7": {
            "Mathematics": ["Integers", "Fractions and Decimals", "Exponents", "Algebraic Expressions", "Simple Linear Equations", "Ratio and Proportion (Including Sharing in a Ratio)", "Unitary Method (Including Time and Work)", "Percent and Percentage", "Profit, Loss and Discount", "Lines and Angles", "Properties of Triangles", "Congruence of Triangles", "Symmetry", "Perimeter and Area", "Data Handling"],
            "Physics": ["Physical Quantities and Measurement", "Motion", "Energy", "Heat", "Light", "Sound"],
            "Chemistry": ["Matter and Its Composition", "Physical and Chemical Changes", "Elements, Compounds and Mixtures", "Atoms, Molecules and Radicals", "Language of Chemistry", "Acids, Bases and Salts"],
            "Biology": ["Plant and Animal Tissues", "Classification of Plants", "Classification of Animals", "Photosynthesis and Respiration", "Reproduction in Plants", "Human Body – Excretory System", "Health and Hygiene"],
            "History and Civics": ["The Medieval World", "The Delhi Sultanate", "The Mughal Empire", "The Marathas", "The Modern Age in Europe", "The State Government", "Fundamental Rights and Duties (contd.)"],
            "Geography": ["Atmosphere – Composition and Structure", "Insolation", "Humidity", "Rainfall", "Weather and Climate", "Water Cycle", "Soils"],
            "English": ["Prose", "Poetry", "Grammar", "Composition", "Comprehension"]
        },
        "8": {
            "Mathematics": ["Rational Numbers", "Exponents (Powers)", "Squares and Square Roots", "Cubes and Cube Roots", "Playing with Numbers", "Sets", "Percent and Percentage", "Profit, Loss and Discount", "Interest (Simple and Compound)", "Algebraic Expressions", "Factorisation", "Simultaneous Linear Equations", "Inequalities", "Understanding Shapes", "Representing Solid Shapes", "Area of a Trapezium and a Polygon", "Volume and Surface Area of Solids", "Data Handling"],
            "Physics": ["Matter", "Physical Quantities and Measurement", "Force and Pressure", "Energy", "Light Energy", "Sound", "Electricity"],
            "Chemistry": ["Language of Chemistry", "Chemical Reactions", "Hydrogen", "Water", "Carbon and Its Compounds", "Atomic Structure"],
            "Biology": ["Transportation in Plants", "Reproduction in Plants and Animals", "Ecosystems", "Human Body – Endocrine, Circulatory and Nervous System", "Health and Hygiene", "Food Production"],
            "History and Civics": ["The French Revolution", "The American Revolution", "The Industrial Revolution", "The Indian National Movement (Up to 1947)", "The Indian Constitution"],
            "Geography": ["Population Distribution", "Migration", "Urbanisation", "Industries", "Sources of Energy", "Agriculture", "Waste Management"],
            "English": ["Prose", "Poetry", "Grammar", "Composition", "Comprehension"]
        },
        "9": {
            "Mathematics": ["Rational and Irrational Numbers", "Compound Interest", "Expansions", "Factorisation", "Simultaneous Linear Equations", "Indices (Exponents)", "Logarithms", "Triangles", "Mid-Point and its Converse", "Pythagoras Theorem", "Rectilinear Figures", "Area and Perimeter of Plane Figures", "Circle", "Statistics", "Mean and Median", "Area and Circumference of a Circle", "Solids"],
            "Physics": ["Measurements and Experimentation", "Motion in One Dimension", "Laws of Motion", "Pressure in Fluids and Atmospheric Pressure", "Upthrust in Fluids, Archimedes' Principle and Floatation", "Heat and Energy", "Reflection of Light", "Propagation of Sound Waves", "Current Electricity", "Magnetism"],
            "Chemistry": ["The Language of Chemistry", "Chemical Changes and Reactions", "Water", "Atomic Structure and Chemical Bonding", "The Periodic Table", "Study of Gas Laws", "Atmospheric Pollution"],
            "Biology": ["Introducing Biology", "Cell – The Unit of Life", "Tissues: Plant and Animal Tissues", "The Flower", "Pollination and Fertilization", "Seeds – Structure and Germination", "Respiration in Plants", "Five Kingdom Classification", "Economic Importance of Bacteria and Fungi", "Nutrition", "Digestive System", "Skeleton – Movement and Locomotion", "The Skin – 'Jack of All Trades'", "The Respiratory System", "Hygiene – A Key to Healthy Life", "Diseases: Cause and Control", "AIDS to Health", "Health Organizations"],
            "History and Civics": ["The Harappan Civilization", "The Vedic Period", "Jainism and Buddhism", "The Mauryan Empire", "The Sangam Age", "The Age of the Guptas", "Medieval India – The Sultanate Period", "The Mughal Empire", "The French Revolution", "The Rise of Nationalism in Europe", "Local Self-Government", "The Indian Parliament", "The Union Executive"],
            "Geography": ["Our Earth", "Earth's Structure", "Earthquakes and Volcanoes", "Weathering and Soil Formation", "Humidity and Rainfall", "Natural Regions of the World", "Map Work"],
            "English": ["Prose", "Poetry", "Drama", "Grammar", "Composition", "Comprehension"]
        },
        "10": {
            "Mathematics": ["GST (Goods and Services Tax)", "Banking", "Shares and Dividends", "Linear Inequations", "Quadratic Equations", "Ratio and Proportion", "Factorization of Polynomials", "Matrices", "Arithmetic Progression", "Geometric Progression", "Coordinate Geometry", "Similarity", "Loci", "Circles", "Constructions", "Mensuration", "Trigonometry", "Statistics", "Probability"],
            "Physics": ["Force, Work, Power and Energy", "Machines", "Refraction of Light at Plane Surfaces", "Refraction through a Lens", "Spectrum", "Sound", "Current Electricity", "Electrical Power and Household Electricity", "Electro-Magnetism", "Calorimetry", "Radioactivity and Nuclear Energy"],
            "Chemistry": ["Periodic Table, Periodic Properties and Variations of Properties", "Chemical Bonding", "Study of Acids, Bases and Salts", "Analytical Chemistry", "Mole Concept and Stoichiometry", "Electrolysis", "Metallurgy", "Study of Compounds – Hydrogen Chloride", "Study of Compounds – Ammonia", "Study of Compounds – Nitric Acid", "Study of Compounds – Sulphuric Acid", "Organic Chemistry"],
            "Biology": ["Cell Division", "Genetics – Some Basic Fundamentals", "Absorption by Roots", "Transpiration", "Photosynthesis", "Chemical Coordination in Plants", "The Circulatory System", "The Excretory System", "The Nervous System and Sense Organs", "The Endocrine System", "The Reproductive System", "Human Population", "Pollution – A Rising Environmental Problem"],
            "History and Civics": ["The Growth of Nationalism", "The First War of Independence 1857", "The Growth of the National Movement (1885-1919)", "Mass Phase of the National Movement", "Independence and Partition of India", "The First World War", "Rise of Dictatorships", "The Second World War", "The United Nations", "Universal Declaration of Human Rights", "Major Agencies of the United Nations", "Judiciary", "The Indian Parliament"],
            "Geography": ["Map Study – Interpretation and Topographical Maps", "Climate of India", "Soils in India", "Natural Vegetation of India", "Water Resources of India", "Mineral Resources of India", "Agriculture in India", "Industries in India", "Waste Management", "Transport in India"],
            "English": ["Prose", "Poetry", "Drama", "Grammar", "Composition", "Comprehension"]
        }
    }
};

/**
 * Filter Subjects to show only CORE subjects
 * Rules:
 * 1. Blacklist minor languages and extracurriculars aggressively.
 * 2. Whitelist core terms (math, science, social, etc.)
 */
function isCoreSubject(subject: string): boolean {
    const s = subject.toLowerCase();

    // 1. Explicitly Exclude (Blacklist) - Using word boundaries (\b) to avoid partial matches
    // This prevents "Part" from matching "art", etc.
    const excludeKeywords = [
        "arabic", "assamese", "bengali", "bhoti", "bhutia", "bodo", "french", "german", "gujarati", "gurung",
        "japanese", "kannada", "kashmiri", "kokborok", "lepcha", "limboo", "malayalam", "manipuri", "marathi",
        "mizo", "nepali", "odia", "persian", "punjabi", "rai", "russian", "sherpa", "sindhi", "spanish", "tamang",
        "tamil", "tangkhul", "telugu", "thai", "tibetan", "urdu",
        "art", "music", "painting", "home science", "physical education", "ncc", "work experience",
        "book keeping", "business", "vocational", "accountancy", "typing", "shorthand"
    ];

    for (const ex of excludeKeywords) {
        // \b matches a word boundary (start/end of word)
        const regex = new RegExp(`\\b${ex}\\b`, "i");
        if (regex.test(subject)) return false;
    }

    // 2. Whitelist Core Terms
    const coreKeywords = [
        "math", "algebra", "geometry", "statistics", "calculus",
        "science", "physics", "chemistry", "biology", "evs", "environmental",
        "history", "geography", "civics", "economics", "political science", "social",
        "english", "hindi", "sanskrit",
        "computer", "ai", "artificial intelligence", "ict", "it"
    ];

    return coreKeywords.some(keyword => {
        // For very short keywords like AI or IT, use word boundaries
        if (keyword.length <= 2) {
            const regex = new RegExp(`\\b${keyword}\\b`, "i");
            return regex.test(subject);
        }
        // For others, use substring to catch "Mathematics", "Science and Tech", etc.
        return s.includes(keyword);
    });
}

// Helper: Get subjects for a board and class
export function getSubjects(board: string, grade: string): string[] {
    const boardData = SYLLABUS_DB[board]?.[grade] || {};
    const allSubjects = Object.keys(boardData);
    // Filter to show only core subjects AND only those that have chapters
    // This removes empty placeholder subjects which clutter the CBSE list
    return allSubjects.filter(subject =>
        isCoreSubject(subject) && boardData[subject].length > 0
    );
}

// Helper: Get chapters for a board, class, and subject
export function getChapters(board: string, grade: string, subject: string): string[] {
    return SYLLABUS_DB[board]?.[grade]?.[subject] || [];
}

// Helper: Get available classes for a board
export function getClasses(board: string): string[] {
    return Object.keys(SYLLABUS_DB[board] || {}).sort((a, b) => parseInt(a) - parseInt(b));
}

// Board display names and textbook info
export const BOARD_INFO: Record<string, { name: string; textbook: string; source: string }> = {
    maharashtra: { name: "Maharashtra SSC", textbook: "Balbharati", source: "shaalaa.com, maharashtrastudy.com, selfstudys.com" },
    cbse: { name: "CBSE", textbook: "NCERT", source: "shaalaa.com" },
    icse: { name: "ICSE", textbook: "Selina / Frank", source: "shaalaa.com" }
};
