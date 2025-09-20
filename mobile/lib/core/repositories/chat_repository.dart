import '../services/api_service.dart';
import '../models/chat_message.dart';

class ChatRepository {
  final ApiService _apiService;
  final List<ChatMessage> _messages = [];

  ChatRepository(this._apiService);

  Future<ChatMessage> sendMessage(String content) async {
    try {
      // Add user message to local list
      final userMessage = ChatMessage(
        id: 'user_msg_${DateTime.now().millisecondsSinceEpoch}',
        content: content,
        type: MessageType.text,
        sender: MessageSender.user,
        timestamp: DateTime.now(),
      );
      
      _messages.add(userMessage);

      // Send to API and get AI response
      final response = await _apiService.sendChatMessage(content);
      
      if (response['success'] == true) {
        final aiMessage = ChatMessage.fromJson(response['message']);
        _messages.add(aiMessage);
        return aiMessage;
      }
      
      throw Exception('Failed to get AI response');
    } catch (e) {
      throw Exception('Failed to send message: $e');
    }
  }

  List<ChatMessage> getMessages() {
    return List.unmodifiable(_messages);
  }

  void clearMessages() {
    _messages.clear();
  }

  Future<List<String>> getSuggestions() async {
    try {
      // Return some default suggestions
      return [
        'Tôi muốn tìm dịch vụ glamping',
        'Gợi ý combo cho gia đình',
        'Thiết bị cần thiết cho cắm trại',
        'Địa điểm cắm trại đẹp',
        'Giá cả các dịch vụ',
      ];
    } catch (e) {
      throw Exception('Failed to get suggestions: $e');
    }
  }

  Future<ChatMessage> getWelcomeMessage() async {
    try {
      final welcomeMessage = ChatMessage(
        id: 'welcome_msg',
        content: 'Chào mừng bạn đến với OG Camping! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm kiếm dịch vụ cắm trại, gợi ý combo phù hợp và tư vấn thiết bị cần thiết. Bạn cần hỗ trợ gì hôm nay?',
        type: MessageType.text,
        sender: MessageSender.ai,
        timestamp: DateTime.now(),
        suggestions: [
          'Xem dịch vụ glamping',
          'Tìm combo cho gia đình',
          'Thuê thiết bị cắm trại',
        ],
      );
      
      if (_messages.isEmpty) {
        _messages.add(welcomeMessage);
      }
      
      return welcomeMessage;
    } catch (e) {
      throw Exception('Failed to get welcome message: $e');
    }
  }

  Future<List<ChatMessage>> getChatHistory() async {
    try {
      // In a real app, this would load from local storage or API
      return getMessages();
    } catch (e) {
      throw Exception('Failed to get chat history: $e');
    }
  }
}
