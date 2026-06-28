import { StatusBar } from 'expo-status-bar';
import { Dumbbell, LineChart, Plus, Utensils, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { tabs } from '../data/tabs';
import { colors, radii } from '../styles/theme';
import type { TabKey } from '../types';

type AppShellProps = {
  activeTab: TabKey;
  children: ReactNode;
  onTabChange: (tab: TabKey) => void;
};

export function AppShell({ activeTab, children, onTabChange }: AppShellProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const activeTitle = tabs.find((tab) => tab.key === activeTab)?.label ?? 'Diaita';
  const actions = getQuickActions(activeTab);

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Diaita</Text>
            <Text style={styles.headerSubtitle}>{activeTitle}</Text>
          </View>
          <Pressable
            style={[styles.iconButton, showQuickActions && styles.activeIconButton]}
            onPress={() => setShowQuickActions((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel="Adicionar"
          >
            <Plus size={22} color={colors.primary} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={showQuickActions}
          onRequestClose={() => setShowQuickActions(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowQuickActions(false)}>
            <Pressable style={styles.actionSheet}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetKicker}>Acoes rapidas</Text>
                  <Text style={styles.sheetTitle}>{activeTitle}</Text>
                </View>
                <Pressable style={styles.sheetCloseButton} onPress={() => setShowQuickActions(false)}>
                  <X size={20} color={colors.primary} />
                </Pressable>
              </View>
              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Pressable
                    key={action.title}
                    style={styles.quickAction}
                    onPress={() => setShowQuickActions(false)}
                    accessibilityRole="button"
                    accessibilityLabel={action.title}
                  >
                    <View style={styles.quickActionIcon}>
                      <Icon size={20} color={colors.primary} />
                    </View>
                    <View style={styles.quickActionBody}>
                      <Text style={styles.quickActionTitle}>{action.title}</Text>
                      <Text style={styles.quickActionText}>{action.description}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </Pressable>
          </Pressable>
        </Modal>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                onPress={() => onTabChange(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Icon
                  size={21}
                  color={isActive ? colors.primary : '#6f7975'}
                  strokeWidth={2.2}
                />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function getQuickActions(activeTab: TabKey) {
  if (activeTab === 'training') {
    return [
      { title: 'Adicionar exercicio', description: 'Use a biblioteca no fim da tela Treino.', icon: Dumbbell },
      { title: 'Criar treino', description: 'Montar uma nova planilha A/B/C.', icon: Plus },
    ];
  }

  if (activeTab === 'diet') {
    return [
      { title: 'Adicionar alimento', description: 'Escolha a refeicao e toque no + do alimento.', icon: Utensils },
      { title: 'Criar alimento', description: 'Abra o formulario manual na aba Dieta.', icon: Plus },
    ];
  }

  if (activeTab === 'progress') {
    return [
      { title: 'Registrar peso', description: 'Adicionar peso e medidas do dia.', icon: LineChart },
      { title: 'Adicionar foto', description: 'Salvar foto de evolucao.', icon: Plus },
    ];
  }

  return [
    { title: 'Registrar treino', description: 'Abrir modo treino pela aba Treino.', icon: Dumbbell },
    { title: 'Registrar refeicao', description: 'Adicionar alimento pela aba Dieta.', icon: Utensils },
  ];
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.background,
    flex: 1,
  },
  shell: {
    flex: 1,
    paddingTop: 54,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  brand: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#68726d',
    fontSize: 14,
    marginTop: 2,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  activeIconButton: {
    backgroundColor: colors.yellowSoft,
  },
  content: {
    paddingBottom: 112,
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(22, 48, 43, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  actionSheet: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    gap: 10,
    padding: 14,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sheetKicker: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sheetTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  sheetCloseButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  quickActionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  quickActionBody: {
    flex: 1,
  },
  quickActionTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  quickActionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    left: 0,
    paddingBottom: 22,
    paddingHorizontal: 10,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: radii.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
  },
  activeTabItem: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    color: '#6f7975',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  activeTabLabel: {
    color: colors.primary,
  },
});
