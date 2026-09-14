import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { AI_SUGGESTIONS, type ChatMessage, sendMessage } from '@/services/mihrab-ai';

function MsgBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>✦</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.bubbleRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>✦</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <ActivityIndicator size="small" color="#1D6555" />
      </View>
    </View>
  );
}

export default function AIScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: t('ai.greeting'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const lang = i18n.language ?? 'tr';

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setTyping(true);
      try {
        const reply = await sendMessage(trimmed, lang);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setTyping(false);
      }
    },
    [typing, lang]
  );

  const suggestionLabel = (s: (typeof AI_SUGGESTIONS)[number]) => {
    if (lang === 'en') return s.labelEn;
    if (lang === 'ar') return s.labelAr;
    return s.labelTr;
  };

  const suggestionPrompt = (s: (typeof AI_SUGGESTIONS)[number]) => {
    if (lang === 'en') return s.promptEn;
    if (lang === 'ar') return s.promptAr;
    return s.promptTr;
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✦</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('ai.eyebrow')}</Text>
            <Text style={styles.headerTitle}>{t('ai.title')}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={10}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              messages.length === 1 ? (
                <View style={styles.suggestionsWrap}>
                  <Text style={styles.suggestionsLabel}>{t('ai.suggestedQuestions')}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionsRow}>
                    {AI_SUGGESTIONS.map((s) => (
                      <Pressable
                        key={s.labelTr}
                        style={styles.chip}
                        onPress={() => submit(suggestionPrompt(s))}>
                        <Text style={styles.chipText}>{suggestionLabel(s)}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null
            }
            renderItem={({ item }) => <MsgBubble msg={item} />}
            ListFooterComponent={typing ? <TypingIndicator /> : null}
          />

          <SafeAreaView edges={['bottom']} style={styles.inputWrap}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={t('ai.placeholder')}
                placeholderTextColor="#A0ADA9"
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => submit(input)}
              />
              <Pressable
                style={[styles.sendBtn, (!input.trim() || typing) && styles.sendBtnDisabled]}
                onPress={() => submit(input)}
                disabled={!input.trim() || typing}>
                <Text style={styles.sendBtnText}>↑</Text>
              </Pressable>
            </View>
            <Text style={styles.disclaimer}>{t('ai.disclaimer')}</Text>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F2' },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  header: {
    alignItems: 'center',
    borderBottomColor: '#E2EAE6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: '#123E36',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerIconText: { color: '#F1CF82', fontSize: 18 },
  headerCopy: { flex: 1 },
  eyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  headerTitle: { color: '#182723', fontSize: 17, fontWeight: '800', marginTop: 1 },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },

  suggestionsWrap: { marginBottom: 16 },
  suggestionsLabel: { color: '#64736E', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  suggestionsRow: { gap: 8 },
  chip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D2DED8',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipText: { color: '#2B3B35', fontSize: 12, fontWeight: '600' },

  bubbleRow: { flexDirection: 'row', gap: 9, marginBottom: 12, alignItems: 'flex-end' },
  bubbleRowUser: { flexDirection: 'row-reverse' },

  avatar: {
    alignItems: 'center',
    backgroundColor: '#123E36',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  avatarText: { color: '#F1CF82', fontSize: 11 },

  bubble: { borderRadius: 18, maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAI: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: '#123E36', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextAI: { color: '#182723' },
  bubbleTextUser: { color: '#FFFFFF' },
  typingBubble: { paddingHorizontal: 16, paddingVertical: 14 },

  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2EAE6',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  inputRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#F0F4F2',
    borderRadius: 22,
    color: '#182723',
    flex: 1,
    fontSize: 14,
    maxHeight: 110,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtn: {
    alignItems: 'center',
    backgroundColor: '#123E36',
    borderRadius: 22,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sendBtnDisabled: { backgroundColor: '#C8D6D1' },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  disclaimer: {
    color: '#9DAAA5',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
