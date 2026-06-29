import { Check, ChevronLeft, ChevronRight, Minus, Plus, Timer, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getExerciseById } from '../data/training';
import { colors, radii } from '../styles/theme';
import type { WorkoutDay, WorkoutSession, WorkoutSetLog } from '../types';
import {
  calculateSessionVolume,
  countCompletedSets,
  getExerciseSetLogs,
  getSessionProgress,
} from '../utils/workoutSession';
import { ExerciseMedia, ExerciseFallbackMedia } from './ExerciseMedia';

type ActiveWorkoutSessionProps = {
  session: WorkoutSession;
  workout: WorkoutDay;
  onCancel: () => void;
  onFinish: (session: WorkoutSession) => void;
  onUpdateSession: (session: WorkoutSession) => void;
};

type PendingAction =
  | {
      type: 'update';
      session: WorkoutSession;
      message: string;
    }
  | {
      type: 'finish';
      session: WorkoutSession;
    };

export function ActiveWorkoutSession({
  session,
  workout,
  onCancel,
  onFinish,
  onUpdateSession,
}: ActiveWorkoutSessionProps) {
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [transitionMessage, setTransitionMessage] = useState('Serie 1 pronta para registrar.');
  const currentWorkoutExercise = workout.exercises[session.currentExerciseIndex];
  const currentExercise = getExerciseById(currentWorkoutExercise.exerciseId);
  const exerciseLogs = getExerciseSetLogs(session, currentWorkoutExercise.exerciseId);
  const currentSet = exerciseLogs[session.currentSetIndex] ?? exerciseLogs[0];
  const completedSets = countCompletedSets(session);
  const sessionVolume = calculateSessionVolume(session);
  const progress = getSessionProgress(session);

  const finishedSession = useMemo(
    () => ({
      ...session,
      finishedAt: new Date().toISOString(),
      status: 'finished' as const,
    }),
    [session],
  );

  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setRestSeconds((current) => (current === null ? null : Math.max(0, current - 1)));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [restSeconds]);

  useEffect(() => {
    if (restSeconds !== 0 || !pendingAction) {
      return;
    }

    const timeout = setTimeout(() => {
      applyPendingAction();
    }, 450);

    return () => clearTimeout(timeout);
  }, [restSeconds, pendingAction]);

  if (!currentExercise || !currentSet) {
    return null;
  }

  const currentExerciseName = currentExercise.name;
  const isResting = restSeconds !== null;

  function updateSession(nextSession: WorkoutSession, message?: string) {
    onUpdateSession(nextSession);

    if (message) {
      setTransitionMessage(message);
    }
  }

  function applyPendingAction() {
    if (!pendingAction) {
      setRestSeconds(null);
      return;
    }

    if (pendingAction.type === 'finish') {
      setRestSeconds(null);
      setPendingAction(null);
      onFinish(pendingAction.session);
      return;
    }

    setRestSeconds(null);
    setPendingAction(null);
    updateSession(pendingAction.session, pendingAction.message);
  }

  function updateSet(setId: string, update: Partial<WorkoutSetLog>) {
    updateSession({
      ...session,
      setLogs: session.setLogs.map((setLog) =>
        setLog.id === setId ? { ...setLog, ...update } : setLog,
      ),
    });
  }

  function completeCurrentSet() {
    const completedSession = {
      ...session,
      setLogs: session.setLogs.map((setLog) =>
        setLog.id === currentSet.id ? { ...setLog, completed: true } : setLog,
      ),
    };

    setRestSeconds(currentWorkoutExercise.restSeconds);
    setTransitionMessage(
      `Serie ${session.currentSetIndex + 1} concluida. Descanso antes de avancar.`,
    );

    if (session.currentSetIndex < exerciseLogs.length - 1) {
      setPendingAction({
        type: 'update',
        session: { ...completedSession, currentSetIndex: session.currentSetIndex + 1 },
        message: `Descanso finalizado. Agora na serie ${session.currentSetIndex + 2}.`,
      });
      onUpdateSession(completedSession);
      return;
    }

    if (session.currentExerciseIndex < workout.exercises.length - 1) {
      const nextWorkoutExercise = workout.exercises[session.currentExerciseIndex + 1];
      const nextExercise = getExerciseById(nextWorkoutExercise.exerciseId);

      setPendingAction({
        type: 'update',
        session: {
          ...completedSession,
          currentExerciseIndex: session.currentExerciseIndex + 1,
          currentSetIndex: 0,
        },
        message: `Descanso finalizado. Proximo exercicio: ${nextExercise?.name ?? 'exercicio'}.`,
      });
      onUpdateSession(completedSession);
      return;
    }

    setPendingAction({
      type: 'finish',
      session: {
        ...completedSession,
        finishedAt: new Date().toISOString(),
        status: 'finished',
      },
    });
    onUpdateSession(completedSession);
  }

  function goToPreviousSet() {
    setRestSeconds(null);
    setPendingAction(null);

    if (session.currentSetIndex > 0) {
      updateSession(
        { ...session, currentSetIndex: session.currentSetIndex - 1 },
        `Voltando para serie ${session.currentSetIndex}.`,
      );
      return;
    }

    if (session.currentExerciseIndex > 0) {
      const previousExerciseIndex = session.currentExerciseIndex - 1;
      const previousExercise = workout.exercises[previousExerciseIndex];
      const previousLogs = getExerciseSetLogs(session, previousExercise.exerciseId);

      updateSession(
        {
          ...session,
          currentExerciseIndex: previousExerciseIndex,
          currentSetIndex: Math.max(previousLogs.length - 1, 0),
        },
        `Voltando para ${getExerciseById(previousExercise.exerciseId)?.name ?? 'exercicio anterior'}.`,
      );
    }
  }

  function goToNextSet() {
    setRestSeconds(null);
    setPendingAction(null);

    if (session.currentSetIndex < exerciseLogs.length - 1) {
      updateSession(
        { ...session, currentSetIndex: session.currentSetIndex + 1 },
        `Agora na serie ${session.currentSetIndex + 2}.`,
      );
      return;
    }

    if (session.currentExerciseIndex < workout.exercises.length - 1) {
      const nextWorkoutExercise = workout.exercises[session.currentExerciseIndex + 1];
      const nextExercise = getExerciseById(nextWorkoutExercise.exerciseId);

      updateSession(
        {
          ...session,
          currentExerciseIndex: session.currentExerciseIndex + 1,
          currentSetIndex: 0,
        },
        `Agora em ${nextExercise?.name ?? 'proximo exercicio'}, serie 1.`,
      );
      return;
    }

    onFinish(finishedSession);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>Treino em andamento</Text>
          <Text style={styles.title}>Treino {workout.label}</Text>
        </View>
        <Pressable style={styles.closeButton} onPress={onCancel} accessibilityLabel="Fechar treino">
          <X size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {completedSets}/{session.setLogs.length} series concluidas
      </Text>

      <View style={styles.statusPanel}>
        <Text style={styles.statusKicker}>Agora</Text>
        <Text style={styles.statusTitle}>
          {currentExerciseName} - serie {session.currentSetIndex + 1} de {exerciseLogs.length}
        </Text>
        <Text style={styles.statusText}>{transitionMessage}</Text>
      </View>

      <View style={styles.exercisePanel}>
        {currentExercise ? <ExerciseMedia exercise={currentExercise} size="lg" /> : <ExerciseFallbackMedia />}
        <View style={styles.exerciseBody}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseMeta}>
            Exercicio {session.currentExerciseIndex + 1}/{workout.exercises.length} - serie{' '}
            {session.currentSetIndex + 1}/{exerciseLogs.length}
          </Text>
          <Text style={styles.exerciseCue}>{currentExercise.executionCue}</Text>
        </View>
      </View>

      <View style={styles.setPanel}>
        <Stepper
          label="Reps"
          value={currentSet.actualReps}
          onDecrease={() => updateSet(currentSet.id, { actualReps: Math.max(0, currentSet.actualReps - 1) })}
          onIncrease={() => updateSet(currentSet.id, { actualReps: currentSet.actualReps + 1 })}
          onChangeValue={(actualReps) => updateSet(currentSet.id, { actualReps })}
        />
        <Stepper
          label="Carga"
          suffix="kg"
          value={currentSet.actualLoadKg}
          onDecrease={() =>
            updateSet(currentSet.id, { actualLoadKg: Math.max(0, currentSet.actualLoadKg - 2.5) })
          }
          onIncrease={() => updateSet(currentSet.id, { actualLoadKg: currentSet.actualLoadKg + 2.5 })}
          onChangeValue={(actualLoadKg) => updateSet(currentSet.id, { actualLoadKg })}
        />
      </View>

      <View style={styles.setTimeline}>
        {exerciseLogs.map((setLog, index) => {
          const isActive = index === session.currentSetIndex;

          return (
            <Pressable
              key={setLog.id}
              style={[
                styles.setBubble,
                setLog.completed && styles.completedSetBubble,
                isActive && styles.activeSetBubble,
              ]}
              onPress={() =>
                {
                  setRestSeconds(null);
                  setPendingAction(null);
                  updateSession(
                    { ...session, currentSetIndex: index },
                    `Selecionada serie ${index + 1} de ${exerciseLogs.length}.`,
                  );
                }
              }
              accessibilityRole="button"
              accessibilityLabel={`Selecionar serie ${index + 1}`}
            >
              <Text
                style={[
                  styles.setBubbleText,
                  setLog.completed && styles.completedSetBubbleText,
                  isActive && styles.activeSetBubbleText,
                ]}
              >
                {setLog.completed ? 'OK' : index + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {restSeconds !== null && (
        <View style={styles.restPanel}>
          <Timer size={19} color={colors.primary} />
          <Text style={styles.restText}>
            {restSeconds > 0 ? `Descanso: ${restSeconds}s` : 'Descanso concluido'}
          </Text>
          <Pressable style={styles.skipRestButton} onPress={applyPendingAction}>
            <Text style={styles.skipRestButtonText}>Pular</Text>
          </Pressable>
        </View>
      )}

      {!isResting && (
        <Pressable
          style={[styles.completeButton, currentSet.completed && styles.completedButton]}
          onPress={completeCurrentSet}
          accessibilityRole="button"
          accessibilityLabel="Concluir serie"
        >
          <Check size={20} color={colors.surface} />
          <Text style={styles.completeButtonText}>
            {currentSet.completed ? 'Registrar descanso novamente' : 'Concluir serie'}
          </Text>
        </Pressable>
      )}

      {!isResting && (
        <View style={styles.navigationRow}>
          <Pressable style={styles.secondaryButton} onPress={goToPreviousSet}>
            <ChevronLeft size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={goToNextSet}>
            <Text style={styles.secondaryButtonText}>Pular serie</Text>
            <ChevronRight size={20} color={colors.primary} />
          </Pressable>
        </View>
      )}

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>{sessionVolume.toLocaleString('pt-BR')} kg volume</Text>
        <Text style={styles.summaryText}>{progress}% completo</Text>
      </View>

      <Pressable style={styles.finishButton} onPress={() => onFinish(finishedSession)}>
        <Text style={styles.finishButtonText}>Finalizar treino</Text>
      </Pressable>
    </View>
  );
}

function Stepper({
  label,
  onChangeValue,
  onDecrease,
  onIncrease,
  suffix,
  value,
}: {
  label: string;
  onChangeValue: (value: number) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  suffix?: string;
  value: number;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable style={styles.stepButton} onPress={onDecrease}>
          <Minus size={18} color={colors.primary} />
        </Pressable>
        <TextInput
          keyboardType="numeric"
          selectTextOnFocus
          style={styles.stepperInput}
          value={formatNumber(value)}
          onChangeText={(text) => onChangeValue(readNumber(text))}
        />
        {suffix && <Text style={styles.stepperSuffix}>{suffix}</Text>}
        <Pressable style={styles.stepButton} onPress={onIncrease}>
          <Plus size={18} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function readNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`;
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 3,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  progressTrack: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: '100%',
  },
  progressText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  statusPanel: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: 16,
  },
  statusKicker: {
    color: colors.yellowSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statusText: {
    color: colors.primarySoft,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  exercisePanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    padding: 12,
  },
  exerciseBody: {
    flex: 1,
    paddingLeft: 14,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  exerciseMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  exerciseCue: {
    color: colors.primaryMid,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  setPanel: {
    flexDirection: 'row',
    gap: 10,
  },
  setTimeline: {
    flexDirection: 'row',
    gap: 8,
  },
  setBubble: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  activeSetBubble: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  completedSetBubble: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  setBubbleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  activeSetBubbleText: {
    color: colors.surface,
  },
  completedSetBubbleText: {
    color: colors.primary,
  },
  stepper: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flex: 1,
    padding: 12,
  },
  stepperLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stepperControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  stepperInput: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 42,
    padding: 0,
    textAlign: 'center',
  },
  stepperSuffix: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  restPanel: {
    alignItems: 'center',
    backgroundColor: colors.yellowSoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  restText: {
    color: colors.primary,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  skipRestButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skipRestButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  completeButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  completedButton: {
    backgroundColor: colors.primaryMid,
  },
  completeButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryText: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    padding: 12,
    textAlign: 'center',
  },
  finishButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radii.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  finishButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
});
