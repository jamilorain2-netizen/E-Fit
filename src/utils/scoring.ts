import { StandardRow, InterpretationResult, Sex } from '../types';

/**
 * Finds matching standard for a given test, student sex, age, and value.
 * If no matching standard exists for the student's age and sex, returns unconfigured result.
 */
export function evaluateTestScore(
  standards: StandardRow[],
  testName: StandardRow['test'],
  value: number,
  studentSex: Sex,
  studentAge: number
): InterpretationResult {
  // Find applicable standards matching test, sex (or 'all'), and age bracket
  const applicableStandards = standards.filter(
    (row) =>
      row.test === testName &&
      (row.sex === studentSex || row.sex === 'all') &&
      studentAge >= row.age_min &&
      studentAge <= row.age_max
  );

  if (applicableStandards.length === 0) {
    return {
      category: 'No standard configured',
      status: 'unconfigured',
      meaning:
        'No reference standard range has been entered for this age (' +
        studentAge +
        ' yrs) and sex in your school standards table.',
      recommendation:
        'Ask your PE teacher to configure standard score brackets for your grade/age group in Teacher Settings.',
      retestGuidance:
        'Record your raw score so your teacher can review or re-evaluate it against updated curriculum norms.',
      source: 'Unconfigured',
      isConfigured: false,
    };
  }

  // Find the matching range
  const matchedRow = applicableStandards.find((row) => {
    // For inclusive matching
    return value >= row.min && value <= row.max;
  });

  if (!matchedRow) {
    // Score might be outside the defined ranges (e.g., higher than max or lower than min)
    // Find closest or report out of range
    const sorted = [...applicableStandards].sort((a, b) => a.min - b.min);
    const minRow = sorted[0];
    const maxRow = sorted[sorted.length - 1];

    if (value < minRow.min) {
      return generateInterpretation(
        testName,
        minRow.category,
        minRow.source,
        true,
        value,
        studentAge,
        studentSex
      );
    } else {
      return generateInterpretation(
        testName,
        maxRow.category,
        maxRow.source,
        true,
        value,
        studentAge,
        studentSex
      );
    }
  }

  return generateInterpretation(
    testName,
    matchedRow.category,
    matchedRow.source,
    true,
    value,
    studentAge,
    studentSex
  );
}

function generateInterpretation(
  test: StandardRow['test'],
  category: string,
  source: string,
  isConfigured: boolean,
  _value: number,
  _age: number,
  _sex: Sex
): InterpretationResult {
  const catLower = category.toLowerCase();

  // Status badge styling classifier
  let status: InterpretationResult['status'] = 'good';
  if (catLower.includes('excellent') || catLower.includes('normal')) {
    status = 'optimal';
  } else if (catLower.includes('good')) {
    status = 'good';
  } else if (catLower.includes('fair')) {
    status = 'fair';
  } else if (
    catLower.includes('needs improvement') ||
    catLower.includes('wasted') ||
    catLower.includes('underweight') ||
    catLower.includes('overweight') ||
    catLower.includes('obese')
  ) {
    status = catLower.includes('needs improvement') ? 'needs_improvement' : 'screening_notice';
  }

  // Component-specific student-friendly explanations & tailored recommendations
  switch (test) {
    case 'step_test': {
      if (status === 'optimal') {
        return {
          category,
          status,
          meaning:
            'Outstanding cardiovascular endurance! Your heart efficiently pumps oxygen to your muscles and returns smoothly to rest after energetic movement.',
          recommendation:
            'Maintain your heart-pumping fun! Keep playing energetic traditional Filipino games like patintero or habulan, jumping rope, cycling, dancing, and brisk walking toward an average of 60 minutes of active play daily.',
          retestGuidance:
            'Retest after 3 to 6 months to monitor your aerobic fitness. Ensure at least 48 hours of recovery before another maximum stepping effort.',
          source,
          isConfigured,
        };
      } else if (status === 'good' || status === 'fair') {
        return {
          category,
          status,
          meaning:
            'Good aerobic foundation! Your cardiovascular system handles rhythmic stepping and recovers in a solid time frame.',
          recommendation:
            'Gradually build your endurance by adding brisk walking, dancing, running games with friends (habulan or agawan base), and active household chores like sweeping the yard or mopping, gradually working toward 60 minutes of daily movement.',
          retestGuidance:
            'Consistent aerobic play will enhance your recovery rate. Rest for 2–3 days before taking another official trial.',
          source,
          isConfigured,
        };
      } else {
        return {
          category,
          status: 'needs_improvement',
          meaning:
            'Your heart rate took a bit longer to recover. Aerobic endurance is a muscle that responds quickly to regular fun movement!',
          recommendation:
            'Start gently! Enjoy daily brisk walks around your barangay, play low-pressure active games, try dancing or jumping rope for 10-15 minute blocks, and count household tasks (sweeping floors, helping carry groceries) as natural physical movement.',
          retestGuidance:
            'Rest well, stay well hydrated with water, and re-test after 3 to 4 weeks of consistent light-to-moderate play.',
          source,
          isConfigured,
        };
      }
    }

    case 'plank': {
      if (status === 'optimal') {
        return {
          category,
          status,
          meaning:
            'Exceptional core muscular endurance! Your abdominal, back, and hip stabilizers held your spine steady with exemplary form.',
          recommendation:
            'Keep your core strong with varied movements like side planks, bird-dogs, swimming motions, and outdoor active games like patintero and gymnastics play.',
          retestGuidance:
            'Never test to form breakdown on consecutive days. Give your core muscles 24-48 hours to rest and rebuild.',
          source,
          isConfigured,
        };
      } else if (status === 'good' || status === 'fair') {
        return {
          category,
          status,
          meaning:
            'Solid core endurance! You maintained stability well during the hold, which protects your posture when sitting in class and carrying your bag.',
          recommendation:
            'Build stamina by practicing short 15 to 30-second plank holds with great form, modified knees-down planks, glute bridges, and daily chores like sweeping or wiping tables.',
          retestGuidance:
            'Remember: the test ends as soon as your hips sag or hike. Retest after 2 weeks of practice.',
          source,
          isConfigured,
        };
      } else {
        return {
          category,
          status: 'needs_improvement',
          meaning:
            'Your core is still developing its endurance. Form fatigue is completely normal and can be improved with progressive practice.',
          recommendation:
            'Practice modified planks on your knees or against an elevated bench/wall for 10-15 seconds. Add bird-dogs and dead-bugs. Movement from sweeping the house or gardening also naturally builds core stability!',
          retestGuidance:
            'Quality over duration: stop as soon as your back feels strained or hips drop. Retest in 2–3 weeks.',
          source,
          isConfigured,
        };
      }
    }

    case 'push_up': {
      if (status === 'optimal') {
        return {
          category,
          status,
          meaning:
            'Terrific upper body strength and endurance! Your chest, shoulders, and triceps demonstrated powerful control throughout the 90-degree motion.',
          recommendation:
            'Challenge yourself with varied bodyweight movement: tempo push-ups, bear crawls, monkey bars, and whole-body sports.',
          retestGuidance:
            'Upper body muscles need 48 hours to rest. Retest in the next grading period.',
          source,
          isConfigured,
        };
      } else if (status === 'good' || status === 'fair') {
        return {
          category,
          status,
          meaning:
            'Good functional upper body strength! You can support and push your bodyweight effectively.',
          recommendation:
            'Keep building strength with 2-3 sets of modified knee push-ups or bench push-ups, bodyweight squats, and everyday lifting movements (e.g. tidying bedroom, helping fold laundry and carry school supplies).',
          retestGuidance:
            'Ensure arms reach a clean 90-degree bend at the elbow without locking out harshly. Retest after 2 weeks of practice.',
          source,
          isConfigured,
        };
      } else {
        return {
          category,
          status: 'needs_improvement',
          meaning:
            'Upper body pushing strength has great room for growth. Pushing strength develops very quickly with progressive steps!',
          recommendation:
            'Start with wall push-ups (standing and pushing away from a sturdy wall) or incline push-ups on a sturdy chair or desk. Transition to kneeling push-ups once wall push-ups feel comfortable.',
          retestGuidance:
            'Focus on straight back alignment. Never force pain in your wrists or shoulders. Retest in 2 to 3 weeks.',
          source,
          isConfigured,
        };
      }
    }

    case 'zipper_right':
    case 'zipper_left': {
      const sideName = test === 'zipper_right' ? 'Right arm over' : 'Left arm over';
      if (status === 'optimal') {
        return {
          category,
          status,
          meaning:
            `Excellent shoulder mobility on your ${sideName}! Your fingertips overlap smoothly, showing open chest and shoulder joint flexibility.`,
          recommendation:
            'Maintain this great flexibility with gentle daily shoulder rolls, cross-body stretches, and active play like badminton, swimming, or volleyball.',
          retestGuidance:
            'Always warm up your shoulders with arm circles before retesting.',
          source,
          isConfigured,
        };
      } else if (status === 'good' || status === 'fair') {
        return {
          category,
          status,
          meaning:
            `Good functional mobility on your ${sideName}. Your fingers are touching or very close, indicating normal daily shoulder range of motion.`,
          recommendation:
            'Practice the towel stretch: hold a small hand towel behind your back and gently inch your hands toward each other. Household chores like wiping windows or hanging clothes help open up shoulder range naturally.',
          retestGuidance:
            'Do not bounce or force your joints. Retest after warm-up.',
          source,
          isConfigured,
        };
      } else {
        return {
          category,
          status: 'needs_improvement',
          meaning:
            `There is a gap between your fingers on your ${sideName}. Tightness from carrying heavy backpacks or prolonged sitting is very common!`,
          recommendation:
            'Try gentle shoulder cross-arm stretches, towel reaches, and doorway chest openers for 20-30 seconds daily. When studying, take movement breaks every 30 minutes to roll your shoulders.',
          retestGuidance:
            'Never jerk or yank your arms to touch fingers. Stretch gently and retest in 2 weeks.',
          source,
          isConfigured,
        };
      }
    }

    case 'sit_and_reach': {
      if (status === 'optimal') {
        return {
          category,
          status,
          meaning:
            'Superior hamstring and lower back flexibility! You reached smoothly past the baseline with controlled form.',
          recommendation:
            'Keep up dynamic flexibility routines, martial arts or dance kicks, and gentle cool-down stretches after every game.',
          retestGuidance:
            'Always perform after a warm-up. Retest in your next PE fitness check.',
          source,
          isConfigured,
        };
      } else if (status === 'good' || status === 'fair') {
        return {
          category,
          status,
          meaning:
            'Good flexibility in your lower back and posterior leg muscles, allowing smooth bending and reducing risk of back tightness.',
          recommendation:
            'Incorporate daily seated or standing toe-reaches (knees soft, exhaling smoothly), butterfly stretch, and yoga poses like child pose or downward dog.',
          retestGuidance:
            'Remember: slide hands smoothly and hold for 2 seconds without bouncing. Retest after a brisk warm-up.',
          source,
          isConfigured,
        };
      } else {
        return {
          category,
          status: 'needs_improvement',
          meaning:
            'Hamstrings and lower back are currently tight. Sitting at school desks or on gadgets often shortens these muscles.',
          recommendation:
            'Perform daily gentle hamstring stretches: sit with one leg straight, bend gently from the hips until you feel a mild stretch, hold for 20 seconds. Stand up and move between study periods!',
          retestGuidance:
            'Never bounce during the reach to avoid muscle strain. Warm up for 5 minutes before retesting.',
          source,
          isConfigured,
        };
      }
    }

    case 'bmi': {
      // NOTE: Strictly following prompt requirements:
      // - Screening measure, not direct body fat or fitness
      // - Never label a student "healthy/unhealthy" from BMI alone
      // - Never encourage weight loss or dieting/restriction
      // - Emphasize varied nutrition, hydration, sleep, and 60 min/day joyful movement
      if (catLower.includes('normal')) {
        return {
          category,
          status: 'optimal',
          meaning:
            'Your weight falls within the expected screening range for your age and sex. Remember that BMI is only an educational screening tool and does not measure muscle mass or overall health.',
          recommendation:
            'Focus on fueling your growing body with diverse local foods (rice, vegetables, fish, fruits, soups), staying well hydrated with plenty of water, getting 8–10 hours of restful sleep, and enjoying 60 minutes of daily physical play.',
          retestGuidance:
            'Height and weight naturally fluctuate during growth spurts. Periodic monitoring is recommended once per school semester.',
          source,
          isConfigured,
        };
      } else if (catLower.includes('wasted') || catLower.includes('underweight')) {
        return {
          category,
          status: 'screening_notice',
          meaning:
            'Your BMI-for-age is lower than the typical reference bracket. Growth spurts, high metabolism, or genetic factors can influence this screening number.',
          recommendation:
            'Focus on energizing your active body with nourishing, nutrient-rich meals and regular snacks (boiled eggs, peanut butter, bananas, whole grains, dairy/milk, mongo). Build strong muscles through fun play and ensure plenty of sleep for tissue growth. No restrictive habits.',
          retestGuidance:
            'Consult with the school nurse or clinic staff for a friendly wellness conversation to ensure your body has all the energy it needs to learn and play.',
          source,
          isConfigured,
        };
      } else {
        // Overweight or Obese bracket
        return {
          category,
          status: 'screening_notice',
          meaning:
            'Your BMI-for-age screening is above the reference median for your peer group. BMI is a general screening indicator and does NOT distinguish between muscle, bone density, and body fat, nor does it define your fitness or worth.',
          recommendation:
            'Celebrate what your body can do! Focus on joyful, energizing movement (playing outdoor games, dancing, riding bikes, helping with family chores) aiming for an average of 60 minutes of active play daily. Enjoy balanced, colorful family meals with abundant water and fresh foods without strict dieting or restriction.',
          retestGuidance:
            'Focus on fitness progress and fun movement rather than numbers on a scale. Discuss with your school health coordinator or family doctor for supportive guidance.',
          source,
          isConfigured,
        };
      }
    }

    default:
      return {
        category,
        status,
        meaning: `Assessment completed for ${test}.`,
        recommendation: 'Continue regular physical education activities and daily movement.',
        retestGuidance: 'Retest as scheduled by your PE instructor.',
        source,
        isConfigured,
      };
  }
}
