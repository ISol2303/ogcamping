import 'package:flutter/foundation.dart';
import '../models/chat_message.dart';
import '../repositories/chat_repository.dart';

class ChatProvider extends ChangeNotifier {
  final ChatRepository _chatRepository;

  ChatProvider(this._chatRepository) {
    _loadWelcomeMessage();
  }

  bool _isLoading = false;
  String? _error;
  bool _isTyping = false;

  // Getters
  List<ChatMessage> get messages => _chatRepository.getMessages();
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isTyping => _isTyping;
  bool get hasMessages => messages.isNotEmpty;

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void _setTyping(bool typing) {
    _isTyping = typing;
    notifyListeners();
  }

  Future<void> _loadWelcomeMessage() async {
    try {
      await _chatRepository.getWelcomeMessage();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Public methods
  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    _setLoading(true);
    _setError(null);
    _setTyping(true);

    try {
      // The repository handles adding the user message and getting AI response
      await _chatRepository.sendMessage(content.trim());
      
      _setLoading(false);
      _setTyping(false);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      _setTyping(false);
    }
  }

  Future<void> sendSuggestion(String suggestion) async {
    await sendMessage(suggestion);
  }

  Future<List<String>> getSuggestions() async {
    try {
      return await _chatRepository.getSuggestions();
    } catch (e) {
      _setError(e.toString());
      return [];
    }
  }

  void clearMessages() {
    _chatRepository.clearMessages();
    _loadWelcomeMessage();
    notifyListeners();
  }

  void clearError() {
    _setError(null);
  }

  Future<void> loadChatHistory() async {
    _setLoading(true);
    
    try {
      await _chatRepository.getChatHistory();
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // Helper methods for UI
  List<ChatMessage> get userMessages => messages.where((msg) => msg.isFromUser).toList();
  List<ChatMessage> get aiMessages => messages.where((msg) => msg.isFromAI).toList();
  
  ChatMessage? get lastMessage => messages.isNotEmpty ? messages.last : null;
  ChatMessage? get lastAIMessage => aiMessages.isNotEmpty ? aiMessages.last : null;
  
  bool get canSendMessage => !_isLoading && !_isTyping;
}
