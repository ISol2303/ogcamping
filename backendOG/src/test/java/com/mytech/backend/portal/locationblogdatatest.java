package com.mytech.backend.portal;

import com.mytech.backend.portal.models.Blog;
import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.models.Blog.BlogType;
import com.mytech.backend.portal.models.Blog.Status;
import com.mytech.backend.portal.repositories.BlogRepository;
import com.mytech.backend.portal.repositories.LocationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

/**
 * Seed 50 camping Locations + 50 Blogs (each blog linked to one location).
 * - Ensure LocationRepository and BlogRepository exist and are wired.
 * - The Blog & Location entities must have setters used below.
 */
@SpringBootTest
public class locationblogdatatest {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Test
    void seed50CampingLocationsAndBlogs() {
        // Clear old data (be careful in prod)
        blogRepository.deleteAll();
        locationRepository.deleteAll();

        List<String[]> data = new ArrayList<>();

        // ---------- MIỀN BẮC (1-15) ----------
        data.add(new String[]{
                "Hồ Đại Lải",
                "Hồ nước nhân tạo rộng gần Hà Nội, không khí trong lành, nhiều bãi cỏ bằng phẳng cho camping.",
                "Cuối tuần tại Hồ Đại Lải: dựng lều ven hồ, chèo kayak buổi sáng, tối tổ chức BBQ và ngắm bầu trời đầy sao."
        });

        data.add(new String[]{
                "Núi Hàm Lợn",
                "Địa điểm trekking gần Hà Nội, có nhiều bãi đất bằng để dựng lều sau khi chinh phục đỉnh.",
                "Hành trình leo Núi Hàm Lợn kết hợp cắm trại: đội mình dựng lều gần rừng, tối đốt lửa, hát hò và sáng hôm sau ngắm bình minh."
        });

        data.add(new String[]{
                "Đồng Mô",
                "Khu du lịch hồ đồng mô, nhiều bãi cỏ rộng, phù hợp team building và gala tối lửa trại.",
                "Team building ở Đồng Mô: trò chơi ngoài trời ban ngày, dựng trại cạnh hồ, BBQ hải sản giả lập và chia sẻ câu chuyện."
        });

        data.add(new String[]{
                "Vườn quốc gia Ba Vì",
                "Rừng núi xanh mát, nhiều trảng cỏ, khí hậu mát mẻ quanh năm, thích hợp cắm trại gia đình.",
                "Một đêm trong rừng Ba Vì: dựng lều gần trảng cỏ, sáng đi trekking trên đường mòn, tối ngồi quây bên lửa trại."
        });

        data.add(new String[]{
                "Núi Trầm",
                "Ngọn núi nhỏ với hang động và trảng cỏ gần Hà Nội, phù hợp cắm trại ngắn ngày.",
                "Picnic & camping ở Núi Trầm: khám phá hang động buổi chiều, dựng lều, sáng mai tham quan cảnh núi đá."
        });

        data.add(new String[]{
                "Thung Nai",
                "Phong cảnh hồ núi hữu tình (Hòa Bình), nhiều ghềnh đá và bãi đá để dựng lều ven nước.",
                "Chèo thuyền, bắt cá và dựng trại ở Thung Nai: buổi chiều ngắm hoàng hôn trên hồ, tối thưởng thức cá nướng."
        });

        data.add(new String[]{
                "Hồ Hòa Bình",
                "Hồ thủy điện lớn với nhiều bãi đất ven hồ, không khí mát mẻ và cảnh quan sơn thủy.",
                "Cắm trại ven hồ Hòa Bình, thử cắm trại trên đảo nhỏ, sáng hôm sau chèo thuyền ra chụp ảnh sương mù."
        });

        data.add(new String[]{
                "Vườn quốc gia Cúc Phương",
                "Rừng nguyên sinh với hệ động vật thực vật phong phú — trải nghiệm camping hoang dã.",
                "Ngủ lều trong VQG Cúc Phương: khám phá ban đêm, học cách sơ cứu cơ bản và tôn trọng thiên nhiên."
        });

        data.add(new String[]{
                "Tràng An",
                "Danh thắng tích hợp sông nước và núi đá, có khu dã ngoại ven sông phù hợp cho cắm trại nhẹ.",
                "Kết hợp thuyền du ngoạn và dựng trại ven sông Tràng An: sáng chèo thuyền, chiều nghỉ ngơi và nướng BBQ."
        });

        data.add(new String[]{
                "Tam Đảo",
                "Khu nghỉ mát trên núi, khí hậu mát mẻ, nhiều điểm cắm trại cho nhóm bạn.",
                "Cắm trại đêm ở Tam Đảo: săn mây sáng sớm, tối se lạnh quây lửa và thưởng thức đồ nướng địa phương."
        });

        data.add(new String[]{
                "Mộc Châu",
                "Cao nguyên nổi tiếng với đồi chè, đồi hoa, nhiều đồng cỏ rộng để dựng lều.",
                "Đêm ở Mộc Châu giữa đồi chè và đồng hoa: thức ăn địa phương, lửa trại và ngắm sao."
        });

        data.add(new String[]{
                "Hồ Thác Bà",
                "Hồ nước lớn Yên Bái với đảo nhỏ, phong cảnh hữu tình, thích hợp cắm trại ven hồ.",
                "Cắm trại trên bờ hồ Thác Bà, sáng chèo SUP tham quan các đảo nhỏ và giao lưu bản làng."
        });

        data.add(new String[]{
                "Hồ Pá Khoang",
                "Hồ đẹp ở Điện Biên, gần bản làng dân tộc, phong cảnh núi non hữu tình.",
                "Dựng lều ven Pá Khoang, sáng dậy tham gia chợ phiên, tối nghe dân bản kể chuyện truyền thống."
        });

        data.add(new String[]{
                "Bắc Sơn",
                "Vùng đồi cỏ lúa ở Lạng Sơn, cảnh hoang sơ, đặc biệt vào mùa lúa chín.",
                "Camping ở Bắc Sơn: ngắm ruộng bậc thang, chụp ảnh hoàng hôn trên đồng lúa và tận hưởng không khí miền núi."
        });

        data.add(new String[]{
                "Vườn quốc gia Xuân Sơn",
                "Rừng nguyên sinh, hệ sinh thái đa dạng, nhiều khu trảng cỏ dã ngoại.",
                "Một đêm giữa rừng Xuân Sơn: trekking ban ngày, dựng lều ban đêm, lắng nghe rừng thở."
        });

        // ---------- MIỀN TRUNG (16-25) ----------
        data.add(new String[]{
                "Hồ Kẻ Gỗ",
                "Hồ lớn ở Hà Tĩnh, rừng thông bao quanh, có bãi cắm trại và lều nghỉ.",
                "Cắm trại ven hồ Kẻ Gỗ, đốt lửa trại, sáng đi bộ đường mòn trong rừng thông."
        });

        data.add(new String[]{
                "Hồ Phú Ninh",
                "Hồ nhân tạo ở Quảng Nam, cảnh quan thoáng đãng, phù hợp cho gia đình và nhóm nhỏ.",
                "Buổi tối ở hồ Phú Ninh: dựng lều, nướng cá câu được và thưởng thức gió hồ."
        });

        data.add(new String[]{
                "Suối Hoa (Đà Nẵng)",
                "Khu du lịch suối có bãi cỏ rộng, thích hợp cho camping gần thành phố Đà Nẵng.",
                "Cắm trại ở Suối Hoa: buổi trưa tắm suối, tối nhóm chơi trò chơi và tổ chức BBQ."
        });

        data.add(new String[]{
                "Rừng dừa Cẩm Thanh",
                "Hội An nổi tiếng với rừng dừa nước, trải nghiệm dựng trại kết hợp thuyền thúng.",
                "Dựng lều gần rừng dừa Cẩm Thanh, sáng đi thuyền thúng khám phá kênh rạch và hái dừa non."
        });

        data.add(new String[]{
                "Hồ Tà Đùng",
                "Vịnh Hạ Long của Tây Nguyên — hồ lớn nhiều đảo, cảnh sắc ngoạn mục.",
                "Cắm trại trên đảo nhỏ ở Tà Đùng, sáng thức dậy ngắm sương mờ trên mặt nước."
        });

        data.add(new String[]{
                "Thác Dray Nur",
                "Thác lớn ở Đắk Lắk, khu vực có bãi cỏ và khe nước mát để dựng lều.",
                "Dựng lều gần Dray Nur, tắm thác mát lạnh và thưởng thức cà phê Buôn Ma Thuột buổi sáng."
        });

        data.add(new String[]{
                "Hồ Ea Kao",
                "Hồ nhỏ yên bình ở Đắk Lắk, nhiều vạt cỏ ven bờ tiện cắm trại.",
                "Trải nghiệm cắm trại ven hồ Ea Kao: câu cá, đốt lửa và nghe tiếng ếch nhái về đêm."
        });

        data.add(new String[]{
                "Biển Mỹ Khê (Quảng Ngãi)",
                "Bãi biển sạch với khu vực dã ngoại, phù hợp cắm trại ven biển.",
                "Cắm trại ven biển Mỹ Khê: thức dậy đón bình minh, nướng đồ biển tươi và nghe sóng rì rào."
        });

        data.add(new String[]{
                "Biển Lăng Cô",
                "Bãi biển đẹp, nước trong xanh, khu vực có điểm dã ngoại bãi cát rộng.",
                "Camping trên cát Lăng Cô, tối tổ chức tiệc nướng hải sản và ngắm sao."
        });

        data.add(new String[]{
                "Suối Voi (Huế)",
                "Khu thác suối có bãi cỏ và dòng suối mát, thích hợp cắm trại trong rừng.",
                "Đêm ở Suối Voi: dựng lều cạnh suối, sáng tắm suối và khám phá thác nhỏ."
        });

        // ---------- TÂY NGUYÊN & NAM TRUNG BỘ (26-35) ----------
        data.add(new String[]{
                "Hồ Tuyền Lâm (Đà Lạt)",
                "Hồ lớn gần Đà Lạt, phim trường tự nhiên với rừng thông và bãi cỏ.",
                "Dựng lều tại Tuyền Lâm, chèo thuyền, tối thưởng thức trà nóng trong khí se lạnh."
        });

        data.add(new String[]{
                "Đồi Trà Cầu Đất (Đà Lạt)",
                "Đồi chè xanh trải dài — không gian yên bình, phù hợp cho cắm trại nhẹ.",
                "Cắm trại giữa đồi chè Cầu Đất, săn mây sáng sớm và chụp ảnh check-in."
        });

        data.add(new String[]{
                "Thung Lũng Vàng (Đà Lạt)",
                "Thung lũng cảnh quan thơ mộng, có bãi cắm nhỏ và đường mòn đi bộ.",
                "Một đêm ấm áp ở Thung Lũng Vàng: dạo bộ buổi chiều, lửa trại và xem sao."
        });

        data.add(new String[]{
                "Hồ Dankia – Suối Vàng",
                "Khu hồ và suối trong Lâm Đồng, phong cảnh hữu tình, nhiều bãi cỏ.",
                "Cắm trại bờ hồ Dankia: sáng đi bộ ven suối, tối nấu ăn ngoài trời và nghỉ ngơi thư giãn."
        });

        data.add(new String[]{
                "Bidoup – Núi Bà",
                "Khu rừng – núi cao, vùng trekking nổi tiếng và có điểm dựng lều an toàn.",
                "Trekking lên Bidoup, dựng trại, sáng đón bình minh trên độ cao và khám phá hệ thực vật."
        });

        data.add(new String[]{
                "Hồ Ea Snô",
                "Hồ yên tĩnh ở Đắk Nông, khu vực ven hồ có nhiều bãi đất bằng.",
                "Cắm trại ven Ea Snô, thưởng thức cà phê sáng và câu cá thư giãn."
        });

        data.add(new String[]{
                "Vườn quốc gia Yok Đôn",
                "Vùng rừng khô hạn rộng lớn, có tour camping kết hợp xem voi và động vật hoang dã.",
                "Camping có hướng dẫn trong Yok Đôn: quan sát động vật, học về hệ sinh thái và ngủ lều an toàn."
        });

        data.add(new String[]{
                "Vườn quốc gia Chư Yang Sin",
                "Khu rừng đặc dụng, trekking & camping cho dân thích phiêu lưu.",
                "Một chuyến camping hoang dã tại Chư Yang Sin: dựng trại, trekking đường dài và tận hưởng hoang sơ."
        });

        data.add(new String[]{
                "Gành Đá Đĩa",
                "Cảnh quan đá bazan độc đáo tại Phú Yên, có khu vực bãi biển nhỏ để dã ngoại.",
                "Cắm trại gần Gành Đá Đĩa: sáng ngắm khối đá kỳ lạ, tối nướng cá ven biển."
        });

        data.add(new String[]{
                "Vũng Rô",
                "Vũng biển xanh trong, bãi cát nhỏ, phù hợp cắm trại ven biển ở Phú Yên.",
                "Một đêm ở Vũng Rô: dựng lều trên cát, nghe sóng, chuẩn bị đồ nướng hải sản."
        });

        // ---------- MIỀN NAM (36-50) ----------
        data.add(new String[]{
                "Hồ Trị An",
                "Hồ lớn ở Đồng Nai, bãi cát và đảo nhỏ, điểm camping gần TP HCM.",
                "Trải nghiệm cắm trại tại Hồ Trị An: chèo SUP, dựng lều trên đảo nhỏ, tối nướng cá tươi."
        });

        data.add(new String[]{
                "Núi Chứa Chan",
                "Ngọn núi có nhiều bãi đất ven rừng, view khu vực Đồng Nai rộng lớn.",
                "Cắm trại trên sườn Núi Chứa Chan: leo sáng, nghỉ trưa và dựng lều ngắm hoàng hôn."
        });

        data.add(new String[]{
                "Núi Bà Đen",
                "Điểm trekking & cắm trại nổi tiếng Tây Ninh (một số khu vực cho phép dựng lều).",
                "Đêm cắm trại gần Núi Bà Đen: leo đỉnh săn bình minh, tối quây lửa kể chuyện."
        });

        data.add(new String[]{
                "Hồ Dầu Tiếng",
                "Hồ nước lớn giữa Bình Dương/Tây Ninh, nhiều bãi cắm ven hồ.",
                "Cắm trại ven hồ Dầu Tiếng: câu cá, nướng BBQ và đón hoàng hôn rực rỡ."
        });

        data.add(new String[]{
                "Suối Mơ",
                "Khu suối thiên nhiên ở Đồng Nai, khu vực có bãi cỏ thoáng để cắm trại.",
                "Cắm trại tại Suối Mơ: tắm suối mát, chơi trò nước và nghỉ ngơi trong lều."
        });

        data.add(new String[]{
                "Thác Giang Điền",
                "Khu du lịch thác với bãi cỏ rộng, thác nước mát lạnh và chỗ dựng lều.",
                "Chuyến đi Giang Điền: dựng lều ven thác, tổ chức BBQ và dạo quanh suối."
        });

        data.add(new String[]{
                "Hồ Cốc",
                "Bãi biển & rừng nhỏ ở Bà Rịa - Vũng Tàu, dịch vụ camping phát triển.",
                "Cắm trại biển ở Hồ Cốc: đêm nghe sóng, sáng dậy chạy bộ trên bãi cát và ăn hải sản."
        });

        data.add(new String[]{
                "Hồ Đá Xanh",
                "Hồ xanh nước trong, nhiều góc sống ảo và bãi cắm nhỏ an toàn.",
                "Dựng lều ven Hồ Đá Xanh, chụp ảnh bình minh và thưởng thức đồ nướng."
        });

        data.add(new String[]{
                "Biển Long Hải",
                "Bãi biển gần Vũng Tàu, có khu vực cho phép dựng lều và cắm trại ven biển.",
                "Cắm trại Long Hải: đốt lửa trại, nướng hải sản và sáng dạo biển."
        });

        data.add(new String[]{
                "Biển Hồ Tràm",
                "Bãi biển hoang sơ, dịch vụ cắm trại phát triển dọc bờ biển.",
                "Camping tại Hồ Tràm: lều trên cát, ngắm bình minh và thưởng thức BBQ."
        });

        data.add(new String[]{
                "Rừng Sác – Cần Giờ",
                "Khu rừng ngập mặn gần TP.HCM, có tour dã ngoại và một số điểm cắm trại an toàn.",
                "Chuyến cắm trại ở Rừng Sác: đốt lửa an toàn, khám phá rừng ngập mặn và hải sản địa phương."
        });

        data.add(new String[]{
                "Khu du lịch Bửu Long",
                "Công viên hồ và đồi cỏ ở Biên Hòa, thuận tiện cho gia đình cắm trại gần TP HCM.",
                "Cắm trại gia đình ở Bửu Long: picnic trên bãi cỏ, chèo thuyền và chơi trò ngoại trời."
        });

        data.add(new String[]{
                "Cánh đồng Cừu Suối Nghệ",
                "Khu du lịch giải trí có hồ nhỏ và dịch vụ cắm trại kiểu nông trại.",
                "Camping tại cánh đồng cừu: trải nghiệm nông trại, chụp ảnh với cừu và ngủ lều nhẹ nhàng."
        });

        data.add(new String[]{
                "Biển Tân Thành",
                "Bãi biển ở Tiền Giang với diện tích dã ngoại, thích hợp camping ven biển.",
                "Đêm trên bãi Tân Thành: cắm lều, nướng đồ biển và trò chuyện dưới trăng."
        });

        data.add(new String[]{
                "Đảo Nam Du",
                "Quần đảo hoang sơ Kiên Giang, nhiều bãi biển phù hợp dựng lều qua đêm.",
                "Cắm trại trên bãi Nam Du: nướng hải sản tươi, lặn ngắm san hô và ngắm sao giữa biển."
        });

        // Sanity: ensure 50 entries
        if (data.size() != 50) {
            throw new IllegalStateException("Expected 50 entries but got: " + data.size());
        }

        for (int i = 0; i < data.size(); i++) {
            String[] item = data.get(i);
            String name = item[0];
            String description = item[1];
            String blogContent = item[2];

            // Create and save Location
            Location location = new Location();
            location.setName(name);
            location.setDescription(description);
            locationRepository.save(location);

            // Create blog for this location
            Blog blog = new Blog();
            blog.setTitle("Trải nghiệm cắm trại tại " + name);
            blog.setContent(blogContent);
            blog.setSummary("Kinh nghiệm và trải nghiệm cắm trại tại " + name);
            blog.setKeywords("cắm trại," + name.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replace(" ", ","));
            blog.setCreatedBy("staff3@gmail.com");
            // thumbnail & imageUrl using slug-like name
            String slug = name.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replace(" ", "-");
            blog.setThumbnail(slug + ".jpg");
            blog.setImageUrl("/uploads" + slug + ".jpg");

            // set enums correctly
            blog.setType(i % 2 == 0 ? BlogType.USER : BlogType.AI);
            blog.setStatus(Status.DRAFT);

            blog.setLocation(location);

            blogRepository.save(blog);
        }

        System.out.println("Seeding completed: " + data.size() + " locations and blogs created.");
    }
}
