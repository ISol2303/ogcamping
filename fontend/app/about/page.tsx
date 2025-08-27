"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tent, Users, Award, Heart, Sparkles, Settings } from "lucide-react"
import Link from "next/link"
import { login } from "../api/auth" // Import from auth.ts

export default function AboutPage() {
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)
  const router = useRouter()

  const teamMembers = [
    {
      name: "Nguyễn Văn A",
      role: "Sáng lập & CEO",
      image: "/team-member-1.jpg",
      description: "Nhà sáng lập với hơn 10 năm kinh nghiệm tổ chức các chuyến cắm trại khắp Việt Nam.",
    },
    {
      name: "Trần Thị B",
      role: "Giám đốc vận hành",
      image: "/team-member-2.jpg",
      description: "Chuyên gia vận hành, đảm bảo mọi chuyến đi đều an toàn và đáng nhớ.",
    },
    {
      name: "Lê Văn C",
      role: "Chuyên gia AI",
      image: "/team-member-3.jpg",
      description: "Người đứng sau công nghệ AI tư vấn, mang đến trải nghiệm cá nhân hóa.",
    },
  ]

  const milestones = [
    {
      year: "2018",
      event: "Thành lập OG Camping",
      description: "Bắt đầu sứ mệnh mang cắm trại đến gần hơn với mọi người.",
    },
    {
      year: "2020",
      event: "Ra mắt dịch vụ AI tư vấn",
      description: "Tích hợp công nghệ AI để gợi ý các chuyến đi cá nhân hóa.",
    },
    {
      year: "2022",
      event: "Mở rộng quốc tế",
      description: "Triển khai các tour cắm trại đến Bali và Thái Lan.",
    },
    {
      year: "2024",
      event: "Đạt 10,000 khách hàng",
      description: "Phục vụ hơn 10,000 khách hàng với đánh giá 4.8/5.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-4 px-4 bg-gradient-to-r from-green-600 to-green-800 text-green-800">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Về OG Camping</h1>
          <p className="text-xl text-back/90 mb-8 max-w-3xl mx-auto">
            Chúng tôi mang đến những trải nghiệm cắm trại độc đáo, kết hợp thiên nhiên và công nghệ AI tiên tiến để tạo nên hành trình đáng nhớ.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
            <Link href="/services">
              <Tent className="w-5 h-5 mr-2" />
              Khám phá dịch vụ
            </Link>
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Mission Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Sứ mệnh của chúng tôi</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <Heart className="w-16 h-16 text-green-600" />
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tại OG Camping, chúng tôi tin rằng cắm trại không chỉ là một chuyến đi, mà là cơ hội để kết nối với thiên nhiên, gia đình và bạn bè. Sứ mệnh của chúng tôi là làm cho mọi chuyến cắm trại trở nên dễ dàng, an toàn và đáng nhớ với sự hỗ trợ của công nghệ AI hiện đại.
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Đội ngũ của chúng tôi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-green-600 mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Milestones Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Hành trình của chúng tôi</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-green-200 h-full"></div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center mb-8 ${index % 2 === 0 ? "flex-row-reverse" : ""}`}
              >
                <div className="w-1/2 px-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-green-600">{milestone.year}</h3>
                      <h4 className="text-lg font-medium mb-2">{milestone.event}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-1/2 px-4">
                  <div className="flex justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full z-10"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Khách hàng là trung tâm</h3>
                <p className="text-gray-600">
                  Mọi quyết định của chúng tôi đều dựa trên việc mang lại trải nghiệm tốt nhất cho khách hàng.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Chất lượng vượt trội</h3>
                <p className="text-gray-600">
                  Cam kết cung cấp thiết bị và dịch vụ chất lượng cao, được kiểm tra kỹ lưỡng.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Yêu thiên nhiên</h3>
                <p className="text-gray-600">
                  Chúng tôi thúc đẩy lối sống bền vững và bảo vệ môi trường trong mọi hoạt động.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-back">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold mb-4">Tham gia cùng chúng tôi</h3>
            <p className="text-xl text-back/90 mb-8 max-w-2xl mx-auto">
              Hãy cùng OG Camping khám phá thiên nhiên và tạo nên những kỷ niệm không thể quên!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                <Link href="/services">
                  <Tent className="w-5 h-5 mr-2" />
                  Xem dịch vụ
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="text-gray-900 border-white hover:bg-white hover:text-gray-900"
                asChild
              >
                <Link href="/contact">
                  <Users className="w-5 h-5 mr-2" />
                  Liên hệ ngay
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tent className="h-8 w-8 text-green-400" />
                <span className="text-2xl font-bold">OG Camping</span>
              </div>
              <p className="text-gray-400">Mang đến trải nghiệm cắm trại hoàn hảo với công nghệ AI tiên tiến</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Dịch vụ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Cắm trại núi
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Cắm trại biển
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Cắm trại gia đình
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className="hover:text-white transition-colors">
                    Thuê thiết bị
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/ai-consultant" className="hover:text-white transition-colors">
                    Tư vấn AI
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/policy" className="hover:text-white transition-colors">
                    Chính sách
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📞 1900 1234</li>
                <li>📧 info@ogcamping.vn</li>
                <li>📍 123 Đường ABC, TP.HCM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OG Camping Private. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}