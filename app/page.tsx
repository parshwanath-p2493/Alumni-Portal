import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Users, Briefcase, Calendar, MessageSquare, ImageIcon, Mail, Phone, MapPin } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image src="/logos/ete-logo.svg" alt="ETE Logo" width={48} height={48} />
                <Image src="/logos/ait-logo.svg" alt="AIT Logo" width={48} height={48} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ETE Alumni Portal</h1>
                <p className="text-sm text-gray-600">Dr. Ambedkar Institute of Technology</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#about" className="text-gray-600 hover:text-blue-600">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-blue-600">
                Contact
              </Link>
              <Link href="#gallery" className="text-gray-600 hover:text-blue-600">
                Gallery
              </Link>
            </nav>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">ETE Alumni Portal</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with fellow Electronics and Telecommunication Engineering graduates, share opportunities, and stay
              connected with your alma mater.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/auth/register">Join the Network</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="#about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Portal Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Job Opportunities</h3>
                <p className="text-gray-600">Alumni can post job openings and students can express interest</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Student Projects</h3>
                <p className="text-gray-600">Showcase your mini and major projects to the community</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real-time Messaging</h3>
                <p className="text-gray-600">Connect and communicate with alumni, students, and faculty instantly</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Events</h3>
                <p className="text-gray-600">Stay updated with department events and activities</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <ImageIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gallery</h3>
                <p className="text-gray-600">Browse and upload photos from department events and activities</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">User Directory</h3>
                <p className="text-gray-600">Find and connect with students, alumni, and faculty</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">About ETE Department</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <p className="text-gray-600 mb-4">
                  The Electronics and Telecommunication Engineering Department at Dr. Ambedkar Institute of Technology
                  has been at the forefront of technological education since its establishment. Our department is
                  committed to providing quality education and fostering innovation in the field of electronics and
                  telecommunications.
                </p>
                <p className="text-gray-600 mb-4">
                  This alumni portal serves as a bridge connecting our current students with successful alumni, creating
                  opportunities for mentorship, career guidance, and professional networking.
                </p>
                <p className="text-gray-600">
                  Join our growing community of ETE professionals and contribute to the success of future engineers.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Alumni Network:</span>
                    <span className="font-semibold">500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Students:</span>
                    <span className="font-semibold">200+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Faculty Members:</span>
                    <span className="font-semibold">25+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Years of Excellence:</span>
                    <span className="font-semibold">20+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Contact Us</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">
                        Dr. Ambedkar Institute of Technology
                        <br />
                        Bengaluru, Karnataka 560056
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+91 80 2839 4545</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">ete@drait.edu.in</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Department Head</h3>
                <div className="space-y-2">
                  <p className="font-medium">Dr. [Name]</p>
                  <p className="text-gray-600">Professor & Head</p>
                  <p className="text-gray-600">Electronics & Telecommunication Engineering</p>
                  <p className="text-gray-600">hod.ete@drait.edu.in</p>
                </div>
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Office Hours</h4>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-8 h-8" />
                <span className="text-xl font-bold">ETE Alumni Portal</span>
              </div>
              <p className="text-gray-400">
                Electronics and Telecommunication Department
                <br />
                Dr. Ambedkar Institute of Technology
                <br />
                Bengaluru, Karnataka
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/gallery/items" className="hover:text-white">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/users/profile" className="hover:text-white">
                    Directory
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#cookies" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Started</h3>
              <p className="text-gray-400 mb-4">Join our growing community of ETE professionals</p>
              <Button asChild>
                <Link href="/auth/register">Register Now</Link>
              </Button>
            </div>
          </div>

          {/* Legal Sections */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div id="privacy" className="mb-8">
              <h4 className="text-lg font-semibold mb-3">Privacy Policy</h4>
              <p className="text-gray-400 text-sm">
                We are committed to protecting your privacy. This portal collects minimal personal information necessary
                for networking and communication purposes. Your data is securely stored and never shared with third
                parties without your consent. You have the right to access, modify, or delete your personal information
                at any time.
              </p>
            </div>

            <div id="terms" className="mb-8">
              <h4 className="text-lg font-semibold mb-3">Terms of Service</h4>
              <p className="text-gray-400 text-sm">
                By using this portal, you agree to maintain professional conduct, respect other users, and use the
                platform for legitimate networking and educational purposes only. Spam, harassment, or misuse of the
                platform is strictly prohibited and may result in account suspension. The portal is provided as-is for
                the benefit of the ETE community.
              </p>
            </div>

            <div id="cookies" className="mb-8">
              <h4 className="text-lg font-semibold mb-3">Cookie Policy</h4>
              <p className="text-gray-400 text-sm">
                This website uses cookies to enhance your browsing experience and maintain your login session. Essential
                cookies are required for the portal to function properly. You can manage cookie preferences through your
                browser settings, though disabling cookies may affect functionality.
              </p>
            </div>
          </div>

          <div className="text-center text-gray-400 pt-4 border-t border-gray-800">
            <p>&copy; 2025 ETE Alumni Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
