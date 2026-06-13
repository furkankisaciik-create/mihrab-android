import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type DailyContentView = 'verse' | 'hadith';

export function DailyContentSwitcher({ selected }: { selected: DailyContentView }) {
  const router = useRouter();

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {([
        ['verse', 'Günün ayeti'],
        ['hadith', 'Günün hadisi'],
      ] as const).map(([value, label]) => {
        const active = selected === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => router.setParams({ view: value })}
            style={({ pressed }) => [
              styles.option,
              active && styles.optionActive,
              pressed && styles.optionPressed,
            ]}>
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E4ECE8',
    borderRadius: 17,
    flexDirection: 'row',
    marginBottom: 18,
    padding: 4,
  },
  option: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#24483E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  optionPressed: {
    opacity: 0.75,
  },
  label: {
    color: '#6D7E78',
    fontSize: 12,
    fontWeight: '700',
  },
  labelActive: {
    color: '#174D42',
    fontWeight: '900',
  },
});
