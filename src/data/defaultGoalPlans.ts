import {
  GoalPlanTemplateData,
  ExerciseItem,
  ChoreItem,
  GoalNutritionGuide,
  GoalCategory,
} from '../types';

export const SAFETY_NOTICE_TEXT =
  'Stop if you feel pain, dizziness, chest discomfort, or unusual shortness of breath. If you have a health condition or injury, check with your parent/guardian, teacher, or doctor before starting. This plan is educational, not medical advice.';

export const DEFAULT_EXERCISES: ExerciseItem[] = [
  {
    id: 'ex-brisk-walk',
    name: 'Brisk Walking',
    category: 'aerobic',
    instruction:
      'Walk at a purposeful, energetic pace where your breathing quickens but you can still hold a conversation. Swing your arms naturally.',
    easier: 'Walk at a steady, relaxed pace on flat, even ground.',
    harder: 'Power walk with active arm pumps, or walk on a gentle incline/stairs.',
  },
  {
    id: 'ex-jog-intervals',
    name: 'Jogging Intervals',
    category: 'aerobic',
    instruction:
      'Alternate between 1 minute of easy jogging and 1 minute of brisk walking around your yard, court, or barangay street.',
    easier: 'Jog for 30 seconds followed by 90 seconds of walking.',
    harder: 'Jog continuously for 2–3 minutes before a short 30-second walk break.',
  },
  {
    id: 'ex-jump-rope',
    name: 'Jump Rope (or Imaginary Rope)',
    category: 'aerobic',
    instruction:
      'Bounce lightly on the balls of your feet with knees slightly soft. Turn wrists rhythmically. An imaginary rope works just as well!',
    easier: 'Step-bounce side to side or jump rope with slow single bounces.',
    harder: 'Speed rope, boxer skips, or alternating high knees while jumping.',
  },
  {
    id: 'ex-dance',
    name: 'Rhythmic Dance & Groove',
    category: 'aerobic',
    instruction:
      'Move and groove to your favorite upbeat OPM or pop music for continuous aerobic movement, coordinating steps, hops, and arm movements.',
    easier: 'Simple side-steps, marching in place with arm sways to the beat.',
    harder: 'Add full squats, jumps, level changes, and fast-tempo footwork.',
  },
  {
    id: 'ex-patintero',
    name: 'Patintero Agility Drills',
    category: 'aerobic',
    instruction:
      'Mimic playing the traditional Filipino game Patintero: quick lateral shuffles, sudden directional shifts, and fake dodges along imaginary lines.',
    easier: 'Moderate side shuffles with steady pacing across 5 meters.',
    harder: 'Explosive lateral cuts, low defensive stances, and rapid direction changes.',
  },
  {
    id: 'ex-habulan',
    name: 'Habulan / Tag Sprint Intervals',
    category: 'aerobic',
    instruction:
      'Simulate the classic chasing game: short 5-to-10 second accelerations followed by decelerations, weaving around cones or markers.',
    easier: 'Brisk walking with occasional gentle 5-meter jogs.',
    harder: 'Quick zig-zag sprints with touch-the-ground turns.',
  },
  {
    id: 'ex-modified-pushups',
    name: 'Modified / Knee Push-Ups',
    category: 'strength',
    instruction:
      'Place hands slightly wider than shoulders, knees on a mat or towel. Lower chest to elbow depth while keeping your core braced and back straight.',
    easier: 'Incline push-ups against a sturdy wall or high table.',
    harder: 'Standard 90-degree push-ups from toes, or tempo push-ups (3 sec down).',
  },
  {
    id: 'ex-squats',
    name: 'Bodyweight Squats',
    category: 'strength',
    instruction:
      'Stand with feet shoulder-width apart. Push hips back and bend knees as if sitting into an invisible chair. Keep chest up and heels flat.',
    easier: 'Sit-to-stand from a sturdy chair or bench with support.',
    harder: 'Squat pulses at the bottom or jump squats with soft landings.',
  },
  {
    id: 'ex-lunges',
    name: 'Walking & Stepping Lunges',
    category: 'strength',
    instruction:
      'Step forward with one leg and lower hips until both knees bend toward 90 degrees. Push through the front heel to return or step forward.',
    easier: 'Static split squats while holding onto a wall or chair for balance.',
    harder: 'Walking lunges with a 2-second hold at the bottom of each step.',
  },
  {
    id: 'ex-plank-variations',
    name: 'Plank Variations',
    category: 'strength',
    instruction:
      'Hold a forearm plank with elbows under shoulders, body forming a straight line from ears to heels. Squeeze glutes and brace your abs.',
    easier: 'Forearm plank on knees or incline plank against a sturdy bench.',
    harder: 'High plank with shoulder taps or side plank holds.',
  },
  {
    id: 'ex-glute-bridges',
    name: 'Glute Bridges',
    category: 'strength',
    instruction:
      'Lie face up with knees bent and feet flat on the floor. Press through heels to lift hips until thighs and torso align. Squeeze glutes at top.',
    easier: 'Lift hips halfway up with a short 1-second pause.',
    harder: 'Single-leg glute bridges or 5-second isometric holds at the top.',
  },
  {
    id: 'ex-shoulder-stretches',
    name: 'Shoulder & Upper Body Stretches',
    category: 'flexibility',
    instruction:
      'Perform cross-body shoulder pulls, overhead triceps reaches, and gentle chest doorway openers. Breathe smoothly throughout each stretch.',
    easier: 'Gentle backward and forward shoulder rolls without pulling.',
    harder: 'Towel clasp behind back (mimicking Zipper Test reach) held for 20 seconds.',
  },
  {
    id: 'ex-hamstring-stretch',
    name: 'Hamstring & Calf Stretches',
    category: 'flexibility',
    instruction:
      'Extend one leg forward with heel down, hinge forward from hips with a flat back until you feel a gentle release behind the thigh. Do not bounce.',
    easier: 'Seated hamstring stretch on the edge of a chair.',
    harder: 'Floor sit-and-reach with two hands reaching toward toes for 20–30 seconds.',
  },
  {
    id: 'ex-hip-stretches',
    name: 'Hip & Quad Mobility Stretches',
    category: 'flexibility',
    instruction:
      'Kneel in a half-kneeling position, gently tuck pelvis and lean forward to stretch the hip flexor. Include butterfly stretches for inner thighs.',
    easier: 'Standing quad stretch holding a wall or sturdy surface for support.',
    harder: 'Deep low lunge ("runner’s lunge") with gentle thoracic spine twist.',
  },
];

export const DEFAULT_CHORES: ChoreItem[] = [
  {
    id: 'chore-sweeping',
    name: 'Sweeping Floors & Yard',
    tagalogName: 'Pagwawalis ng Bahay at Bakuran',
    description:
      'Using a walis tambo inside or walis tingting in the garden/yard engages shoulders, core, and promotes steady continuous standing movement.',
    benefit: 'Builds functional shoulder endurance and core stability.',
  },
  {
    id: 'chore-mopping',
    name: 'Mopping & Floor Polishing',
    tagalogName: 'Paglalampaso at Pagmomop',
    description:
      'Using a mop or traditional bunot/lampaso activates leg drive, glutes, and upper-body pushing and pulling muscles.',
    benefit: 'Strengthens legs and provides moderate aerobic activity.',
  },
  {
    id: 'chore-gardening',
    name: 'Gardening & Plant Care',
    tagalogName: 'Paghahalaman at Pagtatanim',
    description:
      'Watering plants, pulling weeds, potting soil, and carrying small pails involves functional squatting, lunging, and grip strength.',
    benefit: 'Improves hip mobility, functional squats, and grip power.',
  },
  {
    id: 'chore-dishes',
    name: 'Washing Dishes & Kitchen Tidy',
    tagalogName: 'Paghuhugas ng Pinggan at Paglilinis ng Kusina',
    description:
      'Standing tall at the sink with good posture keeps you moving after meals instead of immediately sitting down.',
    benefit: 'Promotes upright postural endurance and active digestion.',
  },
  {
    id: 'chore-folding',
    name: 'Folding & Hanging Laundry',
    tagalogName: 'Pagtutupi ng Damit at Pagsasampay',
    description:
      'Reaching up to hang laundry on the sampayan and squatting down to the laundry basket trains shoulder reach and gentle knee bends.',
    benefit: 'Increases overhead range of motion and functional coordination.',
  },
];

export const DEFAULT_NUTRITION_GUIDES: Record<GoalCategory, GoalNutritionGuide> = {
  endurance: {
    goalId: 'endurance',
    plateGuide: {
      glow: 'Glow Foods (1/2 plate): Fresh vegetables like malunggay, kangkong, sitaw, squash, plus fresh fruits like saging (banana), papaya, or mangga for vitamins and minerals.',
      grow: 'Grow Foods (1/4 plate): Quality proteins like isda (tilapia, bangus, galunggong), eggs, chicken, beans/monggo, and tokwa (tofu) to repair working muscles.',
      go: 'Go Foods (1/4 plate): Wholesome carbohydrates like kanin (rice), mais (corn), kamote (sweet potato), or oatmeal to provide long-lasting stamina.',
      calcium: 'Bone Builders: Small dried fish (dilis), fortified milk, dark leafy greens, or calcium-rich tofu.',
    },
    sampleDay: {
      breakfast: 'Sinangag (garlic rice) with boiled or scrambled egg, sliced tomatoes, and a ripe banana with water.',
      morningSnack: 'Boiled saba banana or boiled corn on the cob (mais) with a glass of water.',
      lunch: 'Ginisang monggo with lots of malunggay and tinapa/shrimp, grilled or fried tilapia, and 1–1.5 cups of warm rice.',
      afternoonSnack: 'Kamote cue or fresh fruit slices with water before your afternoon activity.',
      dinner: 'Sinigang na isda or manok with kangkong, sitaw, and radish, with steamed rice.',
    },
    hydrationGuideline:
      'Drink 8–10 glasses of clean water daily. Have 1 glass before starting your workout and take sips during rest breaks. Avoid sugary sodas, milk teas, and energy drinks.',
    goalSpecificTips: [
      'Eat consistent meals with complex carbohydrates (like rice, kamote, or corn) to keep your energy steady throughout your training.',
      'Always have breakfast before school or morning PE; it revs up your metabolism and sharpens focus in class.',
      'Saging (banana) is the ultimate natural workout snack for endurance—it provides quick, gentle fuel and potassium.',
    ],
  },
  strength: {
    goalId: 'strength',
    plateGuide: {
      glow: 'Glow Foods (1/2 plate): Colorful vegetables like kalabasa, ampalaya, pechay, string beans, plus vitamin C-rich fruits like dalandan, guava, or papaya.',
      grow: 'Grow Foods (1/4 plate + mindful portion): Lean fish, native chicken, eggs, monggo, peanuts, tokwa, and lentils to supply essential amino acids for muscular strength.',
      go: 'Go Foods (1/4 plate): Generous serving of brown or white rice, kamote, boiled potatoes, or whole grain bread to fuel intense movement.',
      calcium: 'Bone & Muscle Support: Fortified milk, dilis, small bone-in fish, and tofu to protect joints and growing teenage bones.',
    },
    sampleDay: {
      breakfast: 'Two eggs (scrambled or hard-boiled) with pandesal or sinangag, cucumber slices, and warm water or fortified milk.',
      morningSnack: 'A handful of roasted peanuts (mani) or a boiled egg with a glass of water.',
      lunch: 'Chicken tinola with plenty of sayote and dahon ng sili, paired with steamed rice.',
      afternoonSnack: 'Tokwa’t saging or boiled kamote with water.',
      dinner: 'Paksiw or grilled bangus with steamed kangkong/bagoong dip, and warm rice.',
    },
    hydrationGuideline:
      'Hydrate regularly throughout the day. Muscles are over 70% water—proper hydration prevents cramps, supports joint cushion, and boosts strength output.',
    goalSpecificTips: [
      'Include a protein source (egg, fish, chicken, tofu, or monggo) at every main meal to help teenage muscles grow stronger and recover.',
      'Do not skip meals! Building strength requires adequate wholesome food energy every single day.',
      'Enjoy snacks after practice or workouts (like a boiled egg or banana) within an hour to replenish muscles.',
    ],
  },
  flexibility: {
    goalId: 'flexibility',
    plateGuide: {
      glow: 'Glow Foods (1/2 plate): Hydrating fruits and leafy greens like pakwan (watermelon), pipino (cucumber), kangkong, sayote, tomatoes, and citrus fruits.',
      grow: 'Grow Foods (1/4 plate): Fresh fish, tofu, beans, and eggs to maintain tendon and ligament resilience.',
      go: 'Go Foods (1/4 plate): Balanced portions of rice, corn, or cassava for steady daily energy.',
      calcium: 'Joint & Bone Harmony: Dilis, sesame seeds, fortified dairy or plant milk, and leafy greens.',
    },
    sampleDay: {
      breakfast: 'Oatmeal or lugaw with hard-boiled egg, fresh papaya slices, and water.',
      morningSnack: 'Fresh pipino (cucumber) with calamansi or watermelon slices.',
      lunch: 'Inabraw or pinakbet (without heavy pork) with grilled tilapia and steamed rice.',
      afternoonSnack: 'Fresh fruit (like sliced mango or saging) and water.',
      dinner: 'Sinigang na bangus with overflowing kangkong and tomatoes, and warm rice.',
    },
    hydrationGuideline:
      'Water is essential for tissue elasticity! Dehydrated muscles and tendons are stiff and more prone to strains. Aim for 8–10 glasses spread throughout your waking hours.',
    goalSpecificTips: [
      'Eat vibrant colorful vegetables and fruits every day—their antioxidants reduce muscle soreness after stretching.',
      'Include healthy fats in moderation (a little peanut butter, vegetable oil, or fish oils) to keep joint tissues supple.',
      'Warm up with a warm glass of water or mild soup before morning movement sessions to encourage circulation.',
    ],
  },
  active_energy: {
    goalId: 'active_energy',
    plateGuide: {
      glow: 'Glow Foods (1/2 plate): Plentiful fresh native vegetables (malunggay, saluyot, sitaw, carrots) and tropical fruits.',
      grow: 'Grow Foods (1/4 plate): Wholesome proteins like fish, eggs, poultry, and legumes to sustain growing teens.',
      go: 'Go Foods (1/4 plate): Good portions of rice, mais, and root crops for vibrant all-day playground and classroom vitality.',
      calcium: 'Energy Stability: Calcium-rich dilis, fortified milk, or leafy brassicas.',
    },
    sampleDay: {
      breakfast: 'Warm champorado with a bit of milk and dilis on the side, or fried rice with scrambled egg and tomato.',
      morningSnack: 'Sliced banana or fresh seasonal fruit with cool water.',
      lunch: 'Nilagang manok with cabbage, potatoes, and corn, served with steamed rice.',
      afternoonSnack: 'Boiled saba banana or turon (light sugar) with a full glass of water.',
      dinner: 'Ginisang togue (bean sprouts) with tofu, pritong isda, and steamed rice.',
    },
    hydrationGuideline:
      'Keep a reusable water tumbler with you at school and at home. Take sips between classes and active games to maintain high alertness and stamina.',
    goalSpecificTips: [
      'Never skip breakfast! Students who eat a nourishing morning meal have better energy, mood, and memory.',
      'Replace highly processed chips and sugary sodas with fresh fruits, boiled corn, or peanuts for sustained energy without afternoon crashes.',
      'Enjoy regular family meals with home-cooked Filipino dishes rich in diverse native vegetables.',
    ],
  },
  weakest_area: {
    goalId: 'weakest_area',
    plateGuide: {
      glow: 'Glow Foods (1/2 plate): Diverse colorful veggies and fruits to promote comprehensive physical recovery and immunity.',
      grow: 'Grow Foods (1/4 plate): Protein-rich eggs, fish, tokwa, and poultry to rebuild targeted muscles.',
      go: 'Go Foods (1/4 plate): Complex carbohydrate staples like rice, corn, and root crops for steady workout fuel.',
      calcium: 'Structural Support: Fortified milk, dilis, small bone-in fish, and greens for bone and joint resilience.',
    },
    sampleDay: {
      breakfast: 'Sinangag, tortang talong or egg, sliced tomatoes, saging, and clean water.',
      morningSnack: 'Boiled kamote or fresh fruit with water.',
      lunch: 'Chicken pochero or pesang isda with pechay and potatoes, and steamed rice.',
      afternoonSnack: 'Handful of roasted peanuts or boiled saba with water.',
      dinner: 'Sinigang na isda with kangkong and radish, accompanied by steamed rice.',
    },
    hydrationGuideline:
      'Drink 8–10 glasses of water daily. Consistent hydration speeds up recovery in weaker muscle groups and prevents cramping during targeted training.',
    goalSpecificTips: [
      'Targeted improvement takes steady patience. Nourish your body consistently every day—real adaptation takes weeks, not days.',
      'Ensure balanced meals that fuel the specific physical demand (carbohydrates for cardio endurance, protein for strength, hydration for flexibility).',
      'Listen to your body signals: eat when hungry, stop when comfortably full, and never follow restrictive or extreme diets.',
    ],
  },
};

export const DEFAULT_SLEEP_GUIDELINES = {
  recommendedHours: '8 to 10 hours per night for teenagers (Grades 7–10)',
  tips: [
    'Teenage muscles, bones, and brains grow and repair primarily during deep sleep. 8–10 hours is non-negotiable for real fitness gains.',
    'Put away cellphones, tablets, and gaming screens at least 30–45 minutes before sleep to help your mind wind down.',
    'Keep your sleeping area reasonably cool, quiet, and well-ventilated.',
    'Plan dedicated rest days into your weekly routine. Rest is not laziness—it is when your body rebuilds stronger than before.',
    'Listen to your body: if you feel unusually fatigued or achy, take an active recovery day with light walking and stretching instead of intense training.',
  ],
};

export const DEFAULT_GOAL_METADATA: Record<
  GoalCategory,
  {
    title: string;
    tagline: string;
    description: string;
    targetFocus: string;
  }
> = {
  endurance: {
    title: 'Build Endurance (Stamina)',
    tagline: 'Last longer without tiring, keep your heart strong and healthy.',
    description:
      'Focuses on aerobic conditioning, rhythmic movement, and cardiovascular stamina using continuous and interval games suited for school PE.',
    targetFocus: 'Cardiovascular fitness, stamina for sports, and steady daily vitality.',
  },
  strength: {
    title: 'Get Stronger',
    tagline: 'Develop muscular power, body control, and posture.',
    description:
      'Emphasizes bodyweight resistance (push-ups, squats, lunges, planks) to build healthy bones, joint stability, and functional physical strength.',
    targetFocus: 'Upper body, core stability, and lower body muscular endurance.',
  },
  flexibility: {
    title: 'Improve Flexibility',
    tagline: 'Move smoothly, release tightness, and prevent injury.',
    description:
      'Dedicated to static stretching, dynamic mobility, and joint range of motion to improve reaches, postures, and ease of daily movement.',
    targetFocus: 'Shoulder mobility, hamstring length, and hip flexor freedom.',
  },
  active_energy: {
    title: 'Be More Active & Have More Energy',
    tagline: 'Move more every day, feel vibrant and alert.',
    description:
      'A holistic, playful blend of active Filipino games, dance, household chores, and light bodyweight exercises toward the WHO 60-minute daily goal.',
    targetFocus: 'Overall daily physical activity, playful movement, and cheerful alertness.',
  },
  weakest_area: {
    title: 'Improve My Weakest Test Area',
    tagline: 'Turn your lowest PE test score into your next big breakthrough.',
    description:
      'Automatically identifies the fitness test where you have the biggest room for improvement and builds a customized routine targeting that specific component.',
    targetFocus: 'Targeted progression on your identified growth opportunity.',
  },
};

export const DEFAULT_GOAL_PLAN_TEMPLATE_DATA: GoalPlanTemplateData = {
  version: '2026.1-DepEd-JHS',
  safetyNotice: SAFETY_NOTICE_TEXT,
  exercises: DEFAULT_EXERCISES,
  chores: DEFAULT_CHORES,
  nutritionGuides: DEFAULT_NUTRITION_GUIDES,
  sleepGuidelines: DEFAULT_SLEEP_GUIDELINES,
  goalMetadata: DEFAULT_GOAL_METADATA,
};
