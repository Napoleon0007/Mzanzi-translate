import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { LANGUAGES, Language, LangCode } from '../constants/languages';

interface Props {
  label: string;
  selected: LangCode;
  onSelect: (code: LangCode) => void;
}

export function LanguageCard({ label, selected, onSelect }: Props) {
  const [open, setOpen] = React.useState(false);
  const lang = LANGUAGES.find((l) => l.code === selected)!;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.flag}>{lang.flag}</Text>
        <Text style={styles.name}>{lang.name}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Language</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(i) => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.code === selected && styles.optionActive]}
                  onPress={() => { onSelect(item.code); setOpen(false); }}
                >
                  <Text style={styles.optionFlag}>{item.flag}</Text>
                  <Text style={styles.optionName}>{item.name}</Text>
                  {item.code === selected && <Text style={styles.tick}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,180,0.2)',
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  flag:  { fontSize: 28 },
  name:  { color: '#fff', fontSize: 15, fontWeight: '600' },
  chevron: { color: 'rgba(0,255,180,0.6)', fontSize: 18 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0f0f1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20 },
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center', paddingVertical: 18 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, gap: 14 },
  optionActive: { backgroundColor: 'rgba(0,255,180,0.08)' },
  optionFlag: { fontSize: 24 },
  optionName: { color: '#fff', fontSize: 16, flex: 1 },
  tick: { color: '#00ffb4', fontSize: 18 },
});
