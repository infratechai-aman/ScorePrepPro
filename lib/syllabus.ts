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
            "Mathematics": ["Numbers from 1 to 9", "Addition", "Subtraction", "Numbers from 10 to 20", "Time", "Measurement", "Numbers from 21 to 50", "Money", "Data Handling", "Patterns", "Numbers up to 100"],
            "English": ["A Happy Child", "Three Little Kittens", "Lalu and Peelu", "Once I Saw a Little Bird", "Mittu and the Yellow Mango", "Merry-Go-Round", "Circle", "Flying Man", "The Bubble, the Straw and the Shoe"],
            "EVS": ["My Family", "My School", "My Body", "Food We Eat", "Animals", "Plants", "Clothes", "Houses", "Festivals"]
        },
        "2": {
            "Mathematics": ["What is Long, What is Round?", "Counting in Groups", "How Much Can You Carry?", "Counting in Tens", "Patterns", "Footprints", "Jugs and Mugs", "Tens and Ones", "My Funday", "Add Our Points", "Lines and Lines", "Give and Take", "The Longest Step", "Birds Come, Birds Go", "How Many Ponytails?"],
            "English": ["First Day at School", "Haldi's Adventure", "I Am Lucky!", "A Smile", "The Wind and the Sun", "Rain", "Storm in the Garden", "Zoo Manners", "Funny Bunny"],
            "EVS": ["My Family", "My School", "Our Body", "Food", "Water", "Houses", "Animals", "Plants", "Work and Play"]
        },
        "3": {
            "Mathematics": ["Where to Look From", "Fun with Numbers", "Give and Take", "Long and Short", "Shapes and Designs", "Fun with Give and Take", "Time Goes On", "Who is Heavier?", "How Many Times?", "Play with Patterns", "Jugs and Mugs", "Can We Share?", "Smart Charts!"],
            "English": ["The Magic Garden", "Bird Talk", "Nina and the Baby Sparrows", "The Enormous Turnip", "The Balloon Man", "Trains", "My Silly Sister", "Don't Tell", "He is My Brother", "Ship of the Desert"],
            "EVS": ["Poonam's Day Out", "The Plant Fairy", "Water O Water!", "Our First School", "Chhotu's House", "Foods We Eat", "Saying Without Speaking", "Flying High", "It's Raining", "What is Cooking?"]
        },
        "4": {
            "Mathematics": ["Building with Bricks", "Long and Short", "A Trip to Bhopal", "Tick Tick Tick", "The Way the World Looks", "The Junk Seller", "Jugs and Mugs", "Carts and Wheels", "Halves and Quarters", "Play with Patterns", "Tables and Shares", "How Heavy? How Light?", "Fields and Fences", "Smart Charts"],
            "English": ["Wake Up!", "Neha's Alarm Clock", "Noses", "Run!", "Alice in Wonderland", "Don't Be Afraid of the Dark", "Helen Keller", "The Donkey", "Hiawatha", "The Scholar's Mother Tongue"],
            "EVS": ["Going to School", "Ear to Ear", "A Day with Nandu", "The Story of Amrita", "Anita and the Honeybees", "Omana's Journey", "From the Window", "Reaching Grandmother's House", "Changing Families"]
        },
        "5": {
            "Mathematics": ["The Fish Tale", "Shapes and Angles", "How Many Squares?", "Parts and Wholes", "Does It Look the Same?", "Be My Multiple, I'll Be Your Factor", "Can You See the Pattern?", "Mapping Your Way", "Boxes and Sketches", "Tenths and Hundredths", "Area and Its Boundary", "Smart Charts", "Ways to Multiply and Divide", "How Big? How Heavy?"],
            "English": ["Wonderful Waste!", "Flying Together", "Robinson Crusoe Discovers a Footprint", "My Shadow", "Rip Van Winkle", "The Talkative Barber", "Gulliver's Travels", "Topsy-turvy Land", "Around the World in Eighty Days", "Mowgli in the Jungle"],
            "EVS": ["Super Senses", "A Snake Charmer's Story", "From Tasting to Digesting", "Mangoes Round the Year", "Seeds and Seeds", "Every Drop Counts", "Experiments with Water", "A Treat for Mosquitoes", "Up You Go!", "Walls Tell Stories"]
        },
        "6": {
            "Mathematics": ["Knowing Our Numbers", "Whole Numbers", "Playing with Numbers", "Basic Geometrical Ideas", "Understanding Elementary Shapes", "Integers", "Fractions", "Decimals", "Data Handling", "Mensuration", "Algebra", "Ratio and Proportion", "Symmetry", "Practical Geometry"],
            "Science": ["Food: Where Does It Come From?", "Components of Food", "Fibre to Fabric", "Sorting Materials into Groups", "Separation of Substances", "Changes Around Us", "Getting to Know Plants", "Body Movements", "The Living Organisms and Their Surroundings", "Motion and Measurement of Distances", "Light, Shadows and Reflections", "Electricity and Circuits", "Fun with Magnets", "Water", "Air Around Us", "Garbage In, Garbage Out"],
            "Social Science (History)": ["What, Where, How and When?", "From Hunting-Gathering to Growing Food", "In the Earliest Cities", "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas", "Ashoka, The Emperor Who Gave Up War", "Vital Villages, Thriving Towns", "Traders, Kings and Pilgrims", "New Empires and Kingdoms", "Buildings, Paintings and Books"],
            "Social Science (Geography)": ["The Earth in the Solar System", "Globe: Latitudes and Longitudes", "Motions of the Earth", "Maps", "Major Domains of the Earth", "Major Landforms of the Earth", "Our Country – India", "India: Climate, Vegetation and Wildlife"],
            "Social Science (Civics)": ["Understanding Diversity", "Diversity and Discrimination", "What is Government?", "Key Elements of a Democratic Government", "Panchayati Raj", "Rural Administration", "Urban Administration", "Rural Livelihoods", "Urban Livelihoods"],
            "English": ["Who Did Patrick's Homework?", "How the Dog Found Himself a New Master!", "Taro's Reward", "An Indian – American Woman in Space: Kalpana Chawla", "A Different Kind of School", "Who I Am", "Fair Play", "The Banyan Tree"]
        },
        "7": {
            "Mathematics": ["Integers", "Fractions and Decimals", "Data Handling", "Simple Equations", "Lines and Angles", "The Triangle and its Properties", "Congruence of Triangles", "Comparing Quantities", "Rational Numbers", "Practical Geometry", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers", "Symmetry", "Visualising Solid Shapes"],
            "Science": ["Nutrition in Plants", "Nutrition in Animals", "Fibre to Fabric", "Heat", "Acids, Bases and Indicators", "Physical and Chemical Changes", "Weather, Climate and Adaptations of Animals to Climate", "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and Its Effects", "Light", "Water: A Precious Resource", "Forests: Our Lifeline", "Wastewater Story"],
            "Social Science (History)": ["Tracing Changes Through a Thousand Years", "New Kings and Kingdoms", "The Delhi Sultans", "The Mughal Empire", "Rulers and Buildings", "Towns, Traders and Craftspersons", "Tribes, Nomads and Settled Communities", "Devotional Paths to the Divine", "The Making of Regional Cultures", "Eighteenth-Century Political Formations"],
            "Social Science (Geography)": ["Environment", "Inside Our Earth", "Our Changing Earth", "Air", "Water", "Natural Vegetation and Wildlife", "Human Environment – Settlement, Transport and Communication", "Human-Environment Interactions – The Tropical and the Subtropical Region", "Life in the Deserts"],
            "Social Science (Civics)": ["On Equality", "Role of Government in Health", "How the State Government Works", "Growing Up as Boys and Girls", "Women Change the World", "Understanding Media", "Understanding Advertising", "Markets Around Us", "A Shirt in the Market"],
            "English": ["Three Questions", "A Gift of Chappals", "Gopal and the Hilsa Fish", "The Ashes That Made Trees Bloom", "Quality", "Expert Detectives", "The Invention of Vita-Wonk", "A Homage to Our Brave Soldiers"]
        },
        "8": {
            "Mathematics": ["Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Practical Geometry", "Data Handling", "Squares and Square Roots", "Cubes and Cube Roots", "Comparing Quantities", "Algebraic Expressions and Identities", "Visualising Solid Shapes", "Mensuration", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs", "Playing with Numbers"],
            "Science": ["Crop Production and Management", "Microorganisms: Friend and Foe", "Synthetic Fibres and Plastics", "Materials: Metals and Non-Metals", "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals", "Cell – Structure and Functions", "Reproduction in Animals", "Reaching the Age of Adolescence", "Force and Pressure", "Friction", "Sound", "Chemical Effects of Electric Current", "Some Natural Phenomena", "Light", "Stars and the Solar System", "Pollution of Air and Water"],
            "Social Science (History)": ["How, When and Where", "From Trade to Territory", "Ruling the Countryside", "Tribals, Dikus and the Vision of a Golden Age", "When People Rebel 1857 and After", "Civilising the 'Native', Educating the Nation", "Women, Caste and Reform", "The Making of the National Movement: 1870s-1947", "India After Independence"],
            "Social Science (Geography)": ["Resources", "Land, Soil, Water, Natural Vegetation and Wildlife Resources", "Mineral and Power Resources", "Agriculture", "Industries", "Human Resources"],
            "Social Science (Civics)": ["The Indian Constitution", "Understanding Secularism", "Why do we need a Parliament?", "Understanding Laws", "Judiciary", "Understanding Marginalisation", "Confronting Marginalisation", "Public Facilities"],
            "English": ["The Best Christmas Present in the World", "The Tsunami", "Glimpses of the Past", "Bepin Choudhury's Lapse of Memory", "The Summit Within", "This is Jody's Fawn", "A Visit to Cambridge", "A Short Monsoon Diary"]
        },
        "9": {
            "Mathematics": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Heron's Formula", "Surface Areas and Volumes", "Statistics"],
            "Science": ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom", "The Fundamental Unit of Life", "Tissues", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Improvement in Food Resources"],
            "Social Science (History)": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World"],
            "Social Science (Geography)": ["India – Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population"],
            "Social Science (Civics)": ["What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "Democratic Rights"],
            "Social Science (Economics)": ["The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"],
            "English": ["The Fun They Had", "The Sound of Music", "The Little Girl", "A Truly Beautiful Mind", "The Snake and the Mirror", "My Childhood", "Reach for the Top", "Kathmandu", "If I Were You"]
        },
        "10": {
            "Mathematics": ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"],
            "Science": ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity", "Light – Reflection and Refraction", "The Human Eye and the Colorful World", "Electricity", "Magnetic Effects of Electric Current", "Our Environment"],
            "Social Science (History)": ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World"],
            "Social Science (Geography)": ["Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of National Economy"],
            "Social Science (Civics)": ["Power Sharing", "Federalism", "Gender, Religion and Caste", "Political Parties", "Outcomes of Democracy"],
            "Social Science (Economics)": ["Development", "Sectors of the Indian Economy", "Money and Credit", "Globalization and the Indian Economy"],
            "English": ["A Letter to God", "Nelson Mandela: Long Walk to Freedom", "Two Stories about Flying", "From the Diary of Anne Frank", "Glimpses of India", "A Baker from Goa", "Coorg", "Tea from Assam", "The Hundred Dresses – I", "The Hundred Dresses – II"]
        },
        "11": {
            "Physics": ["Physical World", "Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation", "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves"],
            "Chemistry": ["Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity in Properties", "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "The s-Block Elements", "The p-Block Elements", "Organic Chemistry – Some Basic Principles and Techniques", "Hydrocarbons", "Environmental Chemistry"],
            "Biology": ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals", "Cell: The Unit of Life", "Biomolecules", "Cell Cycle and Cell Division", "Transport in Plants", "Mineral Nutrition", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration"],
            "Mathematics": ["Sets", "Relations and Functions", "Trigonometric Functions", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Statistics", "Probability"],
            "English": ["The Portrait of a Lady", "We're Not Afraid to Die... if We Can All Be Together", "Discovering Tut: the Saga Continues", "Landscape of the Soul", "The Ailing Planet: the Green Movement's Role", "The Browning Version", "The Adventure", "Silk Road"],
            "Economics": ["Indian Economy on the Eve of Independence", "Indian Economy 1950-1990", "Liberalisation, Privatisation and Globalisation", "Poverty", "Human Capital Formation in India", "Rural Development", "Employment", "Infrastructure", "Environment and Sustainable Development"],
            "History": ["From the Beginning of Time", "Writing and City Life", "An Empire Across Three Continents", "The Central Islamic Lands", "Nomadic Empires", "The Three Orders", "Changing Cultural Traditions", "Confrontation of Cultures", "The Industrial Revolution", "Displacing Indigenous Peoples", "Paths to Modernisation"]
        },
        "12": {
            "Physics": ["Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei", "Semiconductor Electronics", "Communication Systems"],
            "Chemistry": ["The Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "General Principles and Processes of Isolation of Elements", "The p-Block Elements", "The d and f Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
            "Biology": ["Reproduction in Organisms", "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement in Food Production", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
            "Mathematics": ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Application of Derivatives", "Integrals", "Application of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability"],
            "English": ["The Last Lesson", "Lost Spring", "Deep Water", "The Rattrap", "Indigo", "Poets and Pancakes", "The Interview", "Going Places", "My Mother at Sixty-six", "Keeping Quiet", "A Thing of Beauty", "Aunt Jennifer's Tigers"],
            "Economics": ["Introduction to Macroeconomics", "National Income Accounting", "Money and Banking", "Determination of Income and Employment", "Government Budget and the Economy", "Open Economy Macroeconomics"],
            "History": ["Bricks, Beads and Bones", "Kings, Farmers and Towns", "Kinship, Caste and Class", "Thinkers, Beliefs and Buildings", "Through the Eyes of Travellers", "Bhakti-Sufi Traditions", "An Imperial Capital: Vijayanagara", "Peasants, Zamindars and the State", "Colonialism and the Countryside", "Rebels and the Raj", "Mahatma Gandhi and the Nationalist Movement", "Understanding Partition", "Framing the Constitution"]
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

// Helper: Get subjects for a board and class
export function getSubjects(board: string, grade: string): string[] {
    return Object.keys(SYLLABUS_DB[board]?.[grade] || {});
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
