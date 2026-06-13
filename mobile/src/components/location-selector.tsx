import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { normalizeLocationName } from '@/services/location-matching';
import type { DiyanetCity, DiyanetDistrict } from '@/types/prayer';

type LocationSelectorProps = {
  visible: boolean;
  onClose: () => void;
  onUseDeviceLocation: () => Promise<void>;
  onSelect: (city: DiyanetCity, district: DiyanetDistrict) => Promise<unknown>;
  getCities: () => Promise<DiyanetCity[]>;
  getDistricts: (cityId: string) => Promise<DiyanetDistrict[]>;
};

export function LocationSelector({
  visible,
  onClose,
  onUseDeviceLocation,
  onSelect,
  getCities,
  getDistricts,
}: LocationSelectorProps) {
  const [cities, setCities] = useState<DiyanetCity[]>([]);
  const [districts, setDistricts] = useState<DiyanetDistrict[]>([]);
  const [selectedCity, setSelectedCity] = useState<DiyanetCity | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedCity(null);
    setDistricts([]);
    setQuery('');
    setError(null);
    setLoading(true);
    getCities()
      .then(setCities)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'İl listesi alınamadı.'),
      )
      .finally(() => setLoading(false));
  }, [getCities, visible]);

  const items = selectedCity ? districts : cities;
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeLocationName(query);
    if (!normalizedQuery) {
      return items;
    }
    return items.filter((item) => normalizeLocationName(item.name).includes(normalizedQuery));
  }, [items, query]);

  async function chooseCity(city: DiyanetCity) {
    setSelectedCity(city);
    setQuery('');
    setLoading(true);
    setError(null);
    try {
      setDistricts(await getDistricts(city.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'İlçe listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }

  async function chooseDistrict(district: DiyanetDistrict) {
    if (!selectedCity) {
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      await onSelect(selectedCity, district);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Vakitler alınamadı.');
    } finally {
      setActionLoading(false);
    }
  }

  async function useDeviceLocation() {
    setActionLoading(true);
    setError(null);
    try {
      await onUseDeviceLocation();
      onClose();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          {selectedCity ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSelectedCity(null);
                setDistricts([]);
                setQuery('');
              }}
              style={styles.headerButton}>
              <Text style={styles.headerButtonText}>‹ İl</Text>
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}
          <Text style={styles.title}>{selectedCity ? selectedCity.name : 'Bölge seçimi'}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.headerButton}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>

        {!selectedCity && (
          <Pressable
            accessibilityRole="button"
            disabled={actionLoading}
            onPress={useDeviceLocation}
            style={styles.locationAction}>
            <Text style={styles.locationActionIcon}>⌖</Text>
            <View style={styles.locationActionCopy}>
              <Text style={styles.locationActionTitle}>Telefon konumumu kullan</Text>
              <Text style={styles.locationActionText}>İl ve ilçeyi otomatik eşleştir</Text>
            </View>
            {actionLoading && <ActivityIndicator color="#1A594B" />}
          </Pressable>
        )}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={selectedCity ? 'İlçe ara' : 'İl ara'}
          placeholderTextColor="#89958F"
          autoCapitalize="characters"
          style={styles.search}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color="#1A594B" size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                disabled={actionLoading}
                onPress={() =>
                  selectedCity
                    ? chooseDistrict(item as DiyanetDistrict)
                    : chooseCity(item as DiyanetCity)
                }
                style={styles.row}>
                <Text style={styles.rowText}>{item.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6F2',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 72,
  },
  headerButtonText: {
    color: '#1A594B',
    fontSize: 16,
    fontWeight: '700',
  },
  closeText: {
    color: '#1A594B',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  title: {
    color: '#1B2B26',
    fontSize: 18,
    fontWeight: '800',
  },
  locationAction: {
    backgroundColor: '#E5EFEA',
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationActionIcon: {
    color: '#1A594B',
    fontSize: 24,
    marginRight: 13,
  },
  locationActionCopy: {
    flex: 1,
  },
  locationActionTitle: {
    color: '#173E35',
    fontSize: 14,
    fontWeight: '800',
  },
  locationActionText: {
    color: '#60736C',
    fontSize: 12,
    marginTop: 3,
  },
  search: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    color: '#20322C',
    fontSize: 15,
    marginHorizontal: 20,
    paddingHorizontal: 16,
  },
  error: {
    color: '#A33B31',
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 24,
    marginTop: 12,
  },
  loader: {
    marginTop: 50,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  row: {
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EBE7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rowText: {
    color: '#26362F',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    color: '#80918B',
    fontSize: 25,
  },
});
