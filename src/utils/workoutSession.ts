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
      return Array.from({ length: exercise.sets }, (_, index): WorkoutSetLog => ({
        id: `${exercise.exerciseId}-${index + 1}`,
        exerciseId: exercise.exerciseId,
        setNumber: index + 1,
        targetReps: exercise.reps,
        targetLoadKg: exercise.targetLoadKg,
        actualReps: exercise.reps,
        actualLoadKg: exercise.targetLoadKg,
        completed: false,
      }));
    }),
  };
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
