import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class ReviewVideoPlayer extends StatefulWidget {
  final String url;
  const ReviewVideoPlayer({super.key, required this.url});

  @override
  State<ReviewVideoPlayer> createState() => _ReviewVideoPlayerState();
}

class _ReviewVideoPlayerState extends State<ReviewVideoPlayer> {
  late VideoPlayerController _controller;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    debugPrint("🎬 [ReviewVideoPlayer] init with URL: ${widget.url}");

    _controller = VideoPlayerController.network(widget.url);

    _controller.initialize().then((_) {
      debugPrint("🎬 size: ${_controller.value.size}");
      debugPrint("🎬 aspectRatio: ${_controller.value.aspectRatio}");
      debugPrint(
          "✅ Video initialized: duration=${_controller.value.duration}, aspectRatio=${_controller.value.aspectRatio}");
      setState(() {
        _initialized = true;
      });
    }).catchError((e) {
      debugPrint("❌ Error initializing video: $e");
    });

    _controller.addListener(() {
      final value = _controller.value;
      if (value.hasError) {
        debugPrint("⚠️ Video player error: ${value.errorDescription}");
      }
      debugPrint(
          "🎥 State: initialized=${value.isInitialized}, playing=${value.isPlaying}, pos=${value.position}, dur=${value.duration}");
    });
  }

  @override
  void dispose() {
    debugPrint("🛑 Disposing video player for ${widget.url}");
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return Container(
        width: 160,
        height: 120,
        color: Colors.black12,
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          if (_controller.value.isPlaying) {
            debugPrint("⏸️ Pause video");
            _controller.pause();
          } else {
            debugPrint("▶️ Play video");
            _controller.play();
          }
        });
      },
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 200, // hoặc MediaQuery.of(context).size.width
            height: 150,
            child: FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _controller.value.size.width,
                height: _controller.value.size.height,
                child: VideoPlayer(_controller),
              ),
            ),
          ),
          if (!_controller.value.isPlaying)
            const Icon(Icons.play_circle_fill, size: 48, color: Colors.white),
        ],
      ),
    );
  }
}
