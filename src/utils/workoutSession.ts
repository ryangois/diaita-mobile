import type { WorkoutDay, WorkoutSession, WorkoutSetLog } from '../types';

export function createWorkoutSession(workout: WorkoutDay): WorkoutSession {
  return {
    id: `session-${workout.id}-${Date.now()}`,
    workoutId: workout.id,
    startedAt: new Date().toISOString(),
    status: 'active',
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    setLogs: workout.exercises.flatMap((exercise) => {
      const plannedSets = getWorkoutExercisePlannedSets(exercise);

      return plannedSets.map((plannedSet, index): WorkoutSetLog => ({
        id: `${exercise.exerciseId}-${index + 1}-${plannedSet.id}`,
        exerciseId: exercise.exerciseId,
        setNumber: index + 1,
        targetReps: plannedSet.reps,
        targetLoadKg: plannedSet.targetLoadKg,
        targetRestSeconds: plannedSet.restSeconds,
        actualReps: plannedSet.reps,
        actualLoadKg: plannedSet.targetLoadKg,
        completed: false,
      }));
    }),
  };
}

export function getWorkoutExercisePlannedSets(exercise: WorkoutDay['exercises'][number]) {
  if (exercise.plannedSets && exercise.plannedSets.length > 0) {
    return exercise.plannedSets;
  }

  return Array.from({ length: exercise.sets }, (_, index) => ({
    id: `set-${index + 1}`,
    reps: exercise.reps,
    targetLoadKg: exercise.targetLoadKg,
    restSeconds: exercise.restSeconds,
  }));
}

export function getExerciseSetLogs(session: WorkoutSession, exerciseId: string) {
  return session.setLogs.filter((setLog) => setLog.exerciseId === exerciseId);
}

export function calculateSessionVolume(session: WorkoutSession) {
  return session.setLogs.reduce((total, setLog) => {
    if (!setLog.completed) {
      return total;
    }

    return total + setLog.actualReps * setLog.actualLoadKg;
  }, 0);
}

export function countCompletedSets(session: WorkoutSession) {
  return session.setLogs.filter((setLog) => setLog.completed).length;
}

export function getSessionProgress(session: WorkoutSession) {
  if (session.setLogs.length === 0) {
    return 0;
  }

  return Math.round((countCompletedSets(session) / session.setLogs.length) * 100);
}
