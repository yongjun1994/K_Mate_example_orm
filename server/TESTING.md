# 테스트 가이드

## 📋 테스트 개요

이 프로젝트는 포괄적인 테스트 전략을 구현하여 코드 품질과 안정성을 보장합니다.

## 🧪 테스트 유형

### 1. 단위 테스트 (Unit Tests)
- **위치**: `src/**/*.spec.ts`
- **목적**: 개별 함수, 메서드, 클래스의 동작 검증
- **실행**: `npm test` 또는 `npm run test:unit`

#### 구현된 단위 테스트:
- ✅ **AppController**: 기본 애플리케이션 컨트롤러
- ✅ **UsersService**: 사용자 관리 서비스
- ✅ **PostsService**: 게시글 관리 서비스  
- ✅ **CommentsService**: 댓글 관리 서비스
- ✅ **PostsController**: 게시글 API 컨트롤러

### 2. 통합 테스트 (Integration Tests)
- **위치**: `test/**/*.integration.spec.ts`
- **목적**: 여러 컴포넌트 간의 상호작용 검증
- **실행**: `npm run test:integration`

#### 구현된 통합 테스트:
- ✅ **Posts Integration**: 게시글 API 전체 플로우 테스트

### 3. E2E 테스트 (End-to-End Tests)
- **위치**: `test/**/*.e2e-spec.ts`
- **목적**: 전체 애플리케이션의 사용자 시나리오 검증
- **실행**: `npm run test:e2e`

#### 구현된 E2E 테스트:
- ✅ **App E2E**: 기본 애플리케이션 엔드포인트 테스트

## 🚀 테스트 실행

### 모든 테스트 실행
```bash
npm run test:all
```

### 개별 테스트 유형 실행
```bash
# 단위 테스트만
npm run test:unit

# 통합 테스트만  
npm run test:integration

# E2E 테스트만
npm run test:e2e
```

### 테스트 커버리지 확인
```bash
npm run test:cov
```

### 테스트 감시 모드 (개발 중)
```bash
npm run test:watch
```

## 📊 현재 테스트 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **전체** | **36.21%** | **33.98%** | **25.53%** | **37.44%** |
| Posts Service | 97.72% | 60.71% | 100% | 97.61% |
| Comments Service | 94.59% | 70% | 100% | 94.28% |
| Users Service | 100% | 62.5% | 100% | 100% |
| Posts Controller | 100% | 66.66% | 100% | 100% |

## 🛠️ 테스트 환경 설정

### 데이터베이스
- **테스트 DB**: MySQL (`k_mate_test`)
- **설정**: `test/test.env`
- **특징**: 
  - `dropSchema: true` - 테스트마다 스키마 재생성
  - `synchronize: true` - 자동 스키마 동기화
  - `logging: false` - 로그 비활성화

### 테스트 도구
- **Jest**: 테스트 프레임워크
- **Supertest**: HTTP 테스트
- **@nestjs/testing**: NestJS 테스트 유틸리티
- **TypeORM**: 데이터베이스 테스트

## 📝 테스트 작성 가이드

### 서비스 테스트 예시
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let repository: Repository<Entity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: getRepositoryToken(Entity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should return expected result', async () => {
      // Given
      mockRepository.method.mockResolvedValue(expectedResult);

      // When
      const result = await service.methodName(input);

      // Then
      expect(result).toEqual(expectedResult);
      expect(mockRepository.method).toHaveBeenCalledWith(input);
    });
  });
});
```

### 컨트롤러 테스트 예시
```typescript
describe('ControllerName', () => {
  let controller: ControllerName;
  let service: ServiceName;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ControllerName],
      providers: [
        {
          provide: ServiceName,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ControllerName>(ControllerName);
  });

  it('should call service method with correct parameters', async () => {
    // Given
    const input = { data: 'test' };
    mockService.method.mockResolvedValue(expectedResult);

    // When
    const result = await controller.endpoint(input);

    // Then
    expect(result).toEqual(expectedResult);
    expect(mockService.method).toHaveBeenCalledWith(input);
  });
});
```

## 🔧 테스트 헬퍼

### TestHelpers 클래스
`test/test-helpers.ts`에서 제공하는 유틸리티:

```typescript
// 테스트 데이터 생성
const user = await TestHelpers.createTestUser(repository);
const post = await TestHelpers.createTestPost(repository, userId);
const comment = await TestHelpers.createTestComment(repository, userId, postId);

// JWT 토큰 생성
const token = TestHelpers.generateJwtToken(userId);

// 데이터베이스 정리
await TestHelpers.cleanupDatabase([userRepo, postRepo]);
```

## 📋 테스트 체크리스트

### 새 기능 개발 시
- [ ] 서비스 메서드 단위 테스트 작성
- [ ] 컨트롤러 엔드포인트 테스트 작성
- [ ] 통합 테스트 시나리오 추가
- [ ] E2E 테스트 케이스 추가
- [ ] 테스트 커버리지 확인

### 버그 수정 시
- [ ] 버그를 재현하는 테스트 케이스 작성
- [ ] 수정 후 테스트 통과 확인
- [ ] 관련 기능 회귀 테스트 실행

## 🎯 향후 개선 계획

### 추가 구현 필요
- [ ] **Auth Service 테스트**: 인증/인가 로직 테스트
- [ ] **Interactions Service 테스트**: 좋아요/싫어요 기능 테스트
- [ ] **Places Service 테스트**: 장소 관리 기능 테스트
- [ ] **Bookmarks Service 테스트**: 북마크 기능 테스트
- [ ] **Guards 테스트**: JWT, Roles 가드 테스트
- [ ] **DTO 검증 테스트**: 입력 데이터 검증 테스트

### 테스트 커버리지 목표
- **단위 테스트**: 80% 이상
- **통합 테스트**: 주요 API 플로우 100%
- **E2E 테스트**: 핵심 사용자 시나리오 100%

## 🐛 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 실패**
   ```bash
   # MySQL 서비스 확인
   sudo service mysql status
   
   # 테스트 DB 생성
   mysql -u root -p -e "CREATE DATABASE k_mate_test;"
   ```

2. **테스트 타임아웃**
   ```typescript
   // jest.setup.js에서 타임아웃 증가
   jest.setTimeout(30000);
   ```

3. **Mock 데이터 문제**
   ```typescript
   // beforeEach에서 mock 초기화
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

## 📚 참고 자료

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeORM Testing](https://typeorm.io/testing)
