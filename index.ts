// Auto-generated from .proto files. Do not edit manually.
import { Observable } from 'rxjs';

// =========================================
// Namespace: Catalog
// =========================================

export interface ListCoursesRequest {
}

export interface ListCoursesResponse {
  courses?: Course[];
}

export interface Course {
  id?: string;
  title?: string;
  instructorId?: string;
  price?: number;
  description?: string;
  coverImage?: string;
}

export interface Module {
  id?: string;
  courseId?: string;
  title?: string;
  description?: string;
  position?: number;
}

export interface Lesson {
  id?: string;
  moduleId?: string;
  title?: string;
  videoUrl?: string;
  status?: string;
  resources?: Resource[];
  description?: string;
  position?: number;
}

export interface Resource {
  id?: string;
  lessonId?: string;
  title?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface CreateCourseRequest {
  title?: string;
  instructorId?: string;
  price?: number;
  description?: string;
  coverImage?: string;
}

export interface AddModuleRequest {
  courseId?: string;
  title?: string;
  description?: string;
  position?: number;
}

export interface AddLessonRequest {
  moduleId?: string;
  title?: string;
  description?: string;
  position?: number;
}

export interface UpdateLessonVideoRequest {
  lessonId?: string;
  videoUrl?: string;
}

export interface GetCoursesByIdsRequest {
  courseIds?: string[];
}

export interface GetCoursesByIdsResponse {
  courses?: Course[];
}

export interface GetCourseInfoRequest {
  courseId?: string;
}

export interface CourseInfoResponse {
  exists?: boolean;
  price?: number;
}

export interface GetCourseDetailsRequest {
  courseId?: string;
}

export interface CourseDetails {
  id?: string;
  title?: string;
  instructorId?: string;
  price?: number;
  description?: string;
  modules?: ModuleDetails[];
  coverImage?: string;
}

export interface ModuleDetails {
  id?: string;
  title?: string;
  lessons?: Lesson[];
  description?: string;
}

export interface AddResourceRequest {
  lessonId?: string;
  title?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface UpdateCourseRequest {
  courseId?: string;
  title?: string;
  description?: string;
  coverImage?: string;
}

export interface UpdateModuleRequest {
  moduleId?: string;
  title?: string;
  description?: string;
}

export interface UpdateLessonRequest {
  lessonId?: string;
  title?: string;
  description?: string;
}

export interface VerifyOwnershipRequest {
  userId?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

export interface VerifyOwnershipResponse {
  isOwner?: boolean;
}

export interface CatalogService {
  createCourse(request: CreateCourseRequest): Observable<Course> | Promise<Course> | Course;
  addModuleToCourse(request: AddModuleRequest): Observable<Module> | Promise<Module> | Module;
  addLessonToModule(request: AddLessonRequest): Observable<Lesson> | Promise<Lesson> | Lesson;
  updateLessonVideo(request: UpdateLessonVideoRequest): Observable<Lesson> | Promise<Lesson> | Lesson;
  getCoursesByIds(request: GetCoursesByIdsRequest): Observable<GetCoursesByIdsResponse> | Promise<GetCoursesByIdsResponse> | GetCoursesByIdsResponse;
  getCourseInfo(request: GetCourseInfoRequest): Observable<CourseInfoResponse> | Promise<CourseInfoResponse> | CourseInfoResponse;
  listCourses(request: ListCoursesRequest): Observable<ListCoursesResponse> | Promise<ListCoursesResponse> | ListCoursesResponse;
  getCourseDetails(request: GetCourseDetailsRequest): Observable<CourseDetails> | Promise<CourseDetails> | CourseDetails;
  updateCourse(request: UpdateCourseRequest): Observable<CourseDetails> | Promise<CourseDetails> | CourseDetails;
  addResourceToLesson(request: AddResourceRequest): Observable<Resource> | Promise<Resource> | Resource;
  updateModule(request: UpdateModuleRequest): Observable<Module> | Promise<Module> | Module;
  updateLesson(request: UpdateLessonRequest): Observable<Lesson> | Promise<Lesson> | Lesson;
  verifyOwnership(request: VerifyOwnershipRequest): Observable<VerifyOwnershipResponse> | Promise<VerifyOwnershipResponse> | VerifyOwnershipResponse;
}

// =========================================
// Namespace: Enrollment
// =========================================

export interface Enrollment {
  id?: string;
  courseId?: string;
  userId?: string;
  amountPaid?: number;
  progress?: number;
  completedLessons?: string[];
}

export interface EnrollStudentRequest {
  courseId?: string;
  userId?: string;
}

export interface UpdateProgressRequest {
  enrollmentId?: string;
  videoTimestamp?: number;
  totalDuration?: number;
}

export interface MarkLessonCompletedRequest {
  enrollmentId?: string;
  lessonId?: string;
}

export interface GetMyCoursesRequest {
  userId?: string;
}

export interface EnrolledCourse {
  enrollmentId?: string;
  progress?: number;
  courseId?: string;
  title?: string;
  instructorId?: string;
  completedLessons?: string[];
}

export interface GetMyCoursesResponse {
  enrollments?: EnrolledCourse[];
}

export interface EnrollmentService {
  enrollStudent(request: EnrollStudentRequest): Observable<Enrollment> | Promise<Enrollment> | Enrollment;
  updateProgress(request: UpdateProgressRequest): Observable<Enrollment> | Promise<Enrollment> | Enrollment;
  markLessonCompleted(request: MarkLessonCompletedRequest): Observable<Enrollment> | Promise<Enrollment> | Enrollment;
  getMyCourses(request: GetMyCoursesRequest): Observable<GetMyCoursesResponse> | Promise<GetMyCoursesResponse> | GetMyCoursesResponse;
}

// =========================================
// Namespace: Media
// =========================================

// File type discriminator for presign + confirm flow.
// FILE_TYPE_UNSPECIFIED (0) is the proto3 zero value and is treated as
// invalid by both client and server.
export const FILE_TYPE = {
  UNSPECIFIED: 0,
  COVER: 1,
  VIDEO: 2,
  RESOURCE: 3,
} as const;
export type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];

export interface PresignedUrlRequest {
  fileType?: FileType;
  ownerId?: string;
  sizeBytes?: number;
  contentType?: string;
}

export interface PresignedUrlResponse {
  url?: string;
  key?: string;
  expiresAt?: any;
}

export interface ConfirmUploadRequest {
  key?: string;
  ownerId?: string;
  fileType?: FileType;
  sizeBytes?: number;
}

export interface ConfirmUploadResponse {
  canonicalUrl?: string;
  etag?: string;
  lastModified?: any;
}

export interface MediaService {
  generatePresignedUrl(request: PresignedUrlRequest): Observable<PresignedUrlResponse> | Promise<PresignedUrlResponse> | PresignedUrlResponse;
  confirmUpload(request: ConfirmUploadRequest): Observable<ConfirmUploadResponse> | Promise<ConfirmUploadResponse> | ConfirmUploadResponse;
}

// =========================================
// Namespace: Review
// =========================================

export interface Review {
  id?: string;
  course_id?: string;
  user_id?: string;
  rating?: number;
  comment?: string;
  created_at?: any;
}

export interface CreateReviewRequest {
  course_id?: string;
  rating?: number;
  comment?: string;
}

export interface GetReviewRequest {
  id?: string;
}

export interface ReviewResponse {
  review?: Review;
}

export interface UpdateReviewRequest {
  id?: string;
  rating?: number;
  comment?: string;
}

export interface DeleteReviewRequest {
  id?: string;
}

export interface DeleteReviewResponse {
  success?: boolean;
}

export interface ListCourseReviewsRequest {
  course_id?: string;
}

export interface ListCourseReviewsResponse {
  reviews?: Review[];
}

export interface ReviewService {
  createReview(request: CreateReviewRequest): Observable<ReviewResponse> | Promise<ReviewResponse> | ReviewResponse;
  getReview(request: GetReviewRequest): Observable<ReviewResponse> | Promise<ReviewResponse> | ReviewResponse;
  updateReview(request: UpdateReviewRequest): Observable<ReviewResponse> | Promise<ReviewResponse> | ReviewResponse;
  deleteReview(request: DeleteReviewRequest): Observable<DeleteReviewResponse> | Promise<DeleteReviewResponse> | DeleteReviewResponse;
  listCourseReviews(request: ListCourseReviewsRequest): Observable<ListCourseReviewsResponse> | Promise<ListCourseReviewsResponse> | ListCourseReviewsResponse;
}

// =========================================
// Namespace: Sales
// =========================================

export interface ProcessPaymentRequest {
  userId?: string;
  courseIds?: string[];
  amount?: number;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolder?: string;
}

export interface ProcessPaymentResponse {
  success?: boolean;
  transactionId?: string;
  message?: string;
}

export interface SalesService {
  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse> | Promise<ProcessPaymentResponse> | ProcessPaymentResponse;
}

// =========================================
// Namespace: User
// =========================================

export interface GetUserProfileRequest {
}

export interface GetUserProfileResponse {
  name?: string;
}

export interface GetRoleRequest {
}

export interface GetRoleResponse {
  role?: string;
}

export interface SetUserRoleRequest {
  userId?: string;
}

export interface SetUserRoleResponse {
  success?: boolean;
}

export interface GetUsersByIdsRequest {
  userIds?: string[];
}

export interface GetUsersByIdsResponse {
  users?: UserSummary[];
}

export interface UserSummary {
  id?: string;
  name?: string;
  avatarUrl?: string;
}

export interface UserService {
  getUserProfile(request: GetUserProfileRequest): Observable<GetUserProfileResponse> | Promise<GetUserProfileResponse> | GetUserProfileResponse;
  getRole(request: GetRoleRequest): Observable<GetRoleResponse> | Promise<GetRoleResponse> | GetRoleResponse;
  setUserRole(request: SetUserRoleRequest): Observable<SetUserRoleResponse> | Promise<SetUserRoleResponse> | SetUserRoleResponse;
  getUsersByIds(request: GetUsersByIdsRequest): Observable<GetUsersByIdsResponse> | Promise<GetUsersByIdsResponse> | GetUsersByIdsResponse;
}

