import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/navigation/app_router.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hồ sơ cá nhân'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => context.pushNamed(AppRoutes.editProfile),
          ),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.user;
          
          if (user == null) {
            return const Center(
              child: Text('Không tìm thấy thông tin người dùng'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Profile Header
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                          backgroundImage: user.avatar != null 
                              ? NetworkImage(user.avatar!) 
                              : null,
                          child: user.avatar == null
                              ? Text(
                                  user.fullName.substring(0, 1).toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          user.fullName,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user.email,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                        if (user.phoneNumber != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            user.phoneNumber!,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Menu Items
                _buildMenuItem(
                  context,
                  icon: Icons.history,
                  title: 'Lịch sử đặt chỗ',
                  subtitle: 'Xem các đặt chỗ đã thực hiện',
                  onTap: () => context.pushNamed(AppRoutes.bookingHistory),
                ),
                
                _buildMenuItem(
                  context,
                  icon: Icons.favorite,
                  title: 'Yêu thích',
                  subtitle: 'Dịch vụ và thiết bị yêu thích',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng sẽ có trong phiên bản tiếp theo')),
                    );
                  },
                ),
                
                _buildMenuItem(
                  context,
                  icon: Icons.notifications,
                  title: 'Thông báo',
                  subtitle: 'Cài đặt thông báo',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng sẽ có trong phiên bản tiếp theo')),
                    );
                  },
                ),
                
                Consumer<ThemeProvider>(
                  builder: (context, themeProvider, child) {
                    return _buildMenuItem(
                      context,
                      icon: themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
                      title: 'Giao diện',
                      subtitle: themeProvider.isDarkMode ? 'Chế độ sáng' : 'Chế độ tối',
                      onTap: () => themeProvider.toggleTheme(),
                    );
                  },
                ),
                
                _buildMenuItem(
                  context,
                  icon: Icons.language,
                  title: 'Ngôn ngữ',
                  subtitle: 'Tiếng Việt',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng sẽ có trong phiên bản tiếp theo')),
                    );
                  },
                ),
                
                _buildMenuItem(
                  context,
                  icon: Icons.help,
                  title: 'Trợ giúp',
                  subtitle: 'Câu hỏi thường gặp và hỗ trợ',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng sẽ có trong phiên bản tiếp theo')),
                    );
                  },
                ),
                
                _buildMenuItem(
                  context,
                  icon: Icons.info,
                  title: 'Về ứng dụng',
                  subtitle: 'Phiên bản 1.0.0',
                  onTap: () => _showAboutDialog(context),
                ),
                
                const SizedBox(height: 20),
                
                // Logout Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _showLogoutDialog(context),
                    icon: const Icon(Icons.logout, color: Colors.red),
                    label: const Text(
                      'Đăng xuất',
                      style: TextStyle(color: Colors.red),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'OG Camping Private',
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(
          Icons.nature,
          color: Colors.white,
          size: 32,
        ),
      ),
      children: [
        const Text('Ứng dụng đặt dịch vụ cắm trại và thuê thiết bị cắm trại.'),
        const SizedBox(height: 16),
        const Text('Phát triển bởi OG Camping Team'),
      ],
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc chắn muốn đăng xuất?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              final authProvider = context.read<AuthProvider>();
              await authProvider.logout();
              if (context.mounted) {
                context.goNamed(AppRoutes.login);
              }
            },
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
  }
}
