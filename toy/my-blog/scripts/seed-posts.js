// Seed script: generate 23 articles (one per tag) for weipeiluo
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "data", "blog.db");
if (!fs.existsSync(dbPath)) {
  console.error("❌ Database not found at", dbPath);
  console.error("   Run `npm run build` or `next dev` first to initialize the DB.");
  process.exit(1);
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Check weipeiluo's user ID
const user = sqlite.prepare("SELECT id FROM users WHERE username = ?").get("weipeiluo");
if (!user) {
  console.error("❌ weipeiluo not found in database. Make sure the DB is initialized.");
  process.exit(1);
}

const authorId = user.id;
console.log(`✅ Found weipeiluo: id = ${authorId}`);

// Check existing seed posts to avoid duplicates
const existingSlugs = sqlite.prepare("SELECT slug FROM user_posts WHERE slug LIKE 'seed-%'").all();
const existingSlugSet = new Set(existingSlugs.map((r) => r.slug));
console.log(`   Found ${existingSlugSet.size} existing seed posts`);

const now = new Date().toISOString();

// One article per tag
const articles = [
  {
    slug: "seed-react",
    title: "React 19 新特性实战指南",
    category: "frontend",
    tags: JSON.stringify(["react", "tutorial"]),
    description: "从 Server Components 到 Actions，全面了解 React 19 带来的革命性变化",
    content: `React 19 带来了许多令人兴奋的新特性，其中最重要的当属 Server Components 正式稳定。

Server Components 允许我们在服务端渲染组件，减少客户端 JavaScript 体积，提升首屏加载性能。配合 Server Actions，表单提交和数据变更变得前所未有的简单。

另一个重磅更新是 React Actions，它提供了内置的 pending 状态管理和表单处理能力。使用 useTransition 和 useActionState 可以轻松处理异步操作的状态。

useOptimistic 为乐观更新提供了官方支持，让 UI 响应更加即时。此外，新的 use API 允许在渲染期间直接读取 Promise 和 Context。

升级到 React 19 的迁移成本相对较低，主要需要注意对废弃 API 的清理。`,
  },
  {
    slug: "seed-nextjs",
    title: "Next.js 全面进阶：从 App Router 到生产部署",
    category: "frontend",
    tags: JSON.stringify(["nextjs", "tutorial"]),
    description: "深入理解 Next.js App Router 的核心概念与最佳实践",
    content: `Next.js 的 App Router 重新定义了 React 全栈开发的范式。基于文件系统的路由、Server Components 默认、流式渲染等特性让开发体验更上一层楼。

在布局方面，layout.tsx 实现了真正的页面级布局复用，嵌套路由的布局可以独立缓存和更新。Loading 和 Error 边界提供了优雅的加载和错误处理方案。

数据获取方面，Server Components 可以直接在组件中 async/await 获取数据，无需 useEffect 或 SWR。配合缓存和重新验证策略，实现了性能和实时性的完美平衡。

中间件 (Middleware) 让请求拦截、重定向、权限校验变得非常灵活。结合 Edge Runtime，可以实现极速的请求处理。

对于生产部署，要特别注意环境变量管理、图片优化、ISR 配置和性能监控。`,
  },
  {
    slug: "seed-typescript",
    title: "TypeScript 高级类型体操：从入门到精通",
    category: "frontend",
    tags: JSON.stringify(["typescript"]),
    description: "掌握 TypeScript 高级类型技巧，写出更安全、更优雅的代码",
    content: `TypeScript 的类型系统远比大多数人想象的要强大。条件类型、映射类型、模板字面量类型等高级特性可以让我们编写出精确到令人惊叹的类型定义。

条件类型是 TypeScript 类型体操的基石。通过 extends 关键字，我们可以实现类似三元表达式的类型逻辑，配合 infer 关键字还能进行模式匹配。

映射类型让我们能够基于已有类型创建新类型。结合 as 子句和键名重映射，可以实现复杂类型的自动化转换。

模板字面量类型将类型系统扩展到了字符串级别，可以精确匹配特定格式的字符串。配合 infer 模式匹配，可以实现强大的字符串解析类型。

实际项目中，合理使用这些高级类型可以大幅减少运行时错误。但也要注意不要过度设计，保持类型的可读性同样重要。`,
  },
  {
    slug: "seed-javascript",
    title: "现代 JavaScript 开发必备技巧",
    category: "frontend",
    tags: JSON.stringify(["javascript", "tutorial"]),
    description: "ES2020 到 ES2024 的关键特性与实用模式",
    content: `JavaScript 语言持续进化，每个新版本都带来了提升开发效率的特性。从 ES2020 的可选链和空值合并，到 ES2024 的 Promise.withResolvers，这些特性正在改变我们的编码方式。

可选链 (?. ) 让我们告别了冗长的 && 判空链。空值合并运算符 (??) 精确区分 null/undefined 和其他假值，避免了 || 的误判。

Top-level await 让模块级别的异步初始化变得自然，不再需要 IIFE 包装。Promise.allSettled 和 Promise.any 补充了 Promise 组合的完整拼图。

Record 和 Tuple (提案阶段) 为 JavaScript 带来了不可变数据结构。Array 和 Set 的新方法也在不断提升开发体验。

掌握这些新特性不仅能提高编码效率，还能减少 Bug，让代码更具表现力。`,
  },
  {
    slug: "seed-nodejs",
    title: "Node.js 后端开发最佳实践",
    category: "backend",
    tags: JSON.stringify(["nodejs"]),
    description: "构建健壮、可扩展的 Node.js 后端服务",
    content: `Node.js 已经成为构建后端服务的主流选择之一。无论是 RESTful API 还是 GraphQL，Node.js 的异步非阻塞模型都能很好地胜任。

项目结构方面，建议采用模块化分层架构：路由层负责请求分发，服务层处理业务逻辑，数据访问层负责数据库交互。这种清晰的职责划分让代码更易维护。

错误处理是后端开发的重中之重。使用统一的错误处理中间件，定义规范化的错误码和响应格式，能够显著提升 API 的可靠性。

安全性方面，要特别注意输入验证、SQL 注入防护、XSS 防护和 CSRF 防护。使用 helmet、express-rate-limit 等成熟中间件可以有效提升安全性。

性能优化方面，合理使用缓存策略、数据库索引优化、异步处理是关键的优化手段。对于 CPU 密集型任务，考虑使用 Worker Threads。`,
  },
  {
    slug: "seed-python",
    title: "Python 数据科学实战：从 Pandas 到机器学习",
    category: "ai-ml",
    tags: JSON.stringify(["python", "ai"]),
    description: "使用 Python 生态进行数据分析与机器学习建模的完整工作流",
    content: `Python 生态为数据科学提供了从数据采集到模型部署的全链路工具。Pandas 的数据处理能力、NumPy 的数值计算、Matplotlib 的可视化、Scikit-learn 的机器学习算法，构成了数据科学的核心技术栈。

数据清洗是数据科学中最耗时但也最重要的环节。Pandas 提供了丰富的缺失值处理、数据类型转换、数据去重等功能。掌握 groupby、merge、pivot_table 等操作能够应对大部分数据处理需求。

特征工程直接决定模型的上限。包括数值特征标准化、类别特征编码、文本特征抽取、时间特征衍生等。好的特征工程往往比模型选择更能提升效果。`,
  },
  {
    slug: "seed-rust",
    title: "Rust 学习之路：从系统编程到 WebAssembly",
    category: "backend",
    tags: JSON.stringify(["rust"]),
    description: "为什么 Rust 值得学习，以及如何高效掌握这门语言",
    content: `Rust 连续多年蝉联 Stack Overflow 最受喜爱编程语言榜首，其零成本抽象、内存安全保证和卓越的性能使其在系统编程领域独树一帜。

所有权系统是 Rust 最核心的概念。通过所有权、借用和生命周期的规则组合，Rust 在编译阶段就消除了内存泄漏和数据竞争，无需垃圾回收器的参与。

对于 Web 开发者来说，Rust 通过 WebAssembly 进入了前端领域。使用 wasm-pack 可以将 Rust 代码编译为 WASM 模块，在浏览器中获得接近原生的性能。

在服务端，Axum 和 Actix-web 等框架正在快速成熟。搭配 SQLx 和 SeaORM，Rust 完全可以胜任后端开发任务。

虽然学习曲线陡峭，但 Rust 带来的长期收益远超学习成本。`,
  },
  {
    slug: "seed-go",
    title: "Go 语言并发编程实战",
    category: "backend",
    tags: JSON.stringify(["go"]),
    description: "掌握 Go 的 goroutine 与 channel 并发模型",
    content: `Go 语言以其简洁的语法和强大的并发模型在云原生领域广受欢迎。goroutine 和 channel 的组合让并发编程变得前所未有的简单。

Goroutine 的轻量级设计使得我们可以轻松创建成千上万个并发任务。与操作系统线程不同，goroutine 的栈空间只有几 KB，创建和销毁的开销极小。

Channel 是 goroutine 之间的通信桥梁。通过 chan 类型，我们可以安全地在不同 goroutine 之间传递数据，遵循"不要通过共享内存来通信，而要通过通信来共享内存"的原则。

select 语句让我们能够同时监听多个 channel，实现超时控制、优雅退出等高级并发模式。配合 context 包，可以实现请求级别的取消和超时传播。

sync 包提供了 Mutex、WaitGroup、Once 等经典的并发原语，适用于不需要 channel 的场景。`,
  },
  {
    slug: "seed-docker",
    title: "Docker 容器化实战：从开发到部署",
    category: "devops",
    tags: JSON.stringify(["docker", "tutorial"]),
    description: "掌握 Docker 容器化技术，实现一致的开发与生产环境",
    content: `Docker 已经成为了现代软件开发和部署的基础设施。通过容器化技术，我们可以实现开发、测试、生产环境的一致，彻底告别"在我机器上能跑"的问题。

编写高效的 Dockerfile 是容器化的第一步。多阶段构建可以显著减小最终镜像体积，合理的层叠顺序可以充分利用缓存加速构建。使用 .dockerignore 避免不必要的文件进入镜像。

Docker Compose 让多服务应用的编排变得简单。通过一个 YAML 文件定义所有服务、网络和卷，一条命令即可启动整个应用栈。

在生产环境中，还需要考虑日志收集、健康检查、资源限制和安全配置。使用非 root 用户运行容器可以降低安全风险。

容器化不仅仅是部署方式的改变，更是一种开发和协作方式的革新。`,
  },
  {
    slug: "seed-kubernetes",
    title: "Kubernetes 入门与生产实践",
    category: "devops",
    tags: JSON.stringify(["kubernetes"]),
    description: "从 Pod 到 Service Mesh，理解 K8s 核心概念",
    content: `Kubernetes 已经成为容器编排的事实标准。它提供了自动部署、扩展和管理容器化应用的完整平台，但学习曲线也比较陡峭。

Pod 是 Kubernetes 中最小的部署单元，一个 Pod 可以包含一个或多个容器。Deployment 负责声明式地管理 Pod 的期望状态，支持滚动更新和回滚。

Service 提供了稳定的网络入口，将流量负载均衡到一组 Pod。Ingress 则在七层提供路由和 TLS 终结能力，是外部访问集群内服务的标准方式。

ConfigMap 和 Secret 将配置与镜像分离，使得同一镜像可以在不同环境中复用。PersistentVolume 和 PersistentVolumeClaim 解耦了存储的提供和使用。

对于生产集群，还需要考虑命名空间隔离、资源配额（ResourceQuota）、网络策略（NetworkPolicy）和 Pod 安全策略。`,
  },
  {
    slug: "seed-tailwind",
    title: "Tailwind CSS v4 完全指南",
    category: "frontend",
    tags: JSON.stringify(["tailwind"]),
    description: "从基础到进阶，掌握原子化 CSS 的开发范式",
    content: `Tailwind CSS 改变了我们编写样式的方式。v4 版本带来了更快的性能、更简洁的配置和更强大的功能。原子化的 CSS 类名组合取代了传统的语义化 CSS 文件。

Tailwind v4 采用了全新的 CSS 优先配置方式，不再需要 tailwind.config.js。通过 @theme 指令可以直接在 CSS 中定义设计令牌，让定制更加灵活。

响应式设计在 Tailwind 中变得前所未有的简单。sm/md/lg/xl 前缀配合任意值语法，可以精确控制每一个断点下的样式表现。

暗色模式通过 dark: 前缀实现，搭配任意值语法可以创建复杂的主题变体。配合 CSS 自定义属性，可以实现动态换肤。

对于动画效果，Tailwind 提供了丰富的内置动画类，同时也支持通过 @keyframes 自定义动画。`,
  },
  {
    slug: "seed-framer-motion",
    title: "Framer Motion 动画实战：打造流畅的 UI 动效",
    category: "frontend",
    tags: JSON.stringify(["framer-motion"]),
    description: "使用 Framer Motion 为 React 应用添加优雅的动画效果",
    content: `Framer Motion 是 React 生态中最强大的动画库之一。它提供了声明式的 API，让复杂的动效实现变得简单直观。

motion 组件是 Framer Motion 的核心。通过简单的 animate 属性，我们可以为任何 HTML 元素添加动画。initial、animate、exit 三个状态配合 AnimatePresence 可以实现进出场动画。

布局动画是 Framer Motion 的杀手级特性。layoutId 属性可以让不同组件共享动画上下文，实现无缝的布局过渡效果。导航栏指示器的平滑滑动就是利用这个特性实现的。

手势动画支持 hover、tap、drag、pan 等交互手势。配合 whileHover、whileTap 等属性，可以轻松实现按钮交互动效。

滚动驱动动画使用 useInView 和 useScroll 钩子，在元素进入视口时触发动画，提升页面的视觉层次感。`,
  },
  {
    slug: "seed-database",
    title: "数据库选型与设计实践",
    category: "backend",
    tags: JSON.stringify(["database"]),
    description: "关系型与非关系型数据库的选择策略与 schema 设计要点",
    content: `数据库选型是系统设计中的关键决策。关系型数据库如 PostgreSQL 和 MySQL 适合强一致性需求，非关系型数据库如 MongoDB 和 Redis 则在特定场景下有独特优势。

对于大多数 Web 应用，SQLite 是一个被低估的选择。它零配置、单文件存储、性能优异，在并发量不高的场景下完全不输传统数据库。本博客就是使用 SQLite 的典型案例。

Schema 设计要遵循规范化原则，但不要过度规范化。合理的反范式可以减少 JOIN 查询，提升查询性能。索引策略直接影响查询速度，要优先为 WHERE、ORDER BY、JOIN 条件列建立索引。

ORM 工具如 Drizzle ORM 提供了类型安全的查询构建能力，编译期就能发现 SQL 错误。但复杂查询还是需要手写 SQL 来确保执行效率。

事务管理是保证数据一致性的关键。要理解不同隔离级别的含义和影响。`,
  },
  {
    slug: "seed-api",
    title: "API 设计规范与最佳实践",
    category: "backend",
    tags: JSON.stringify(["api"]),
    description: "设计 RESTful API 的核心原则与常见模式",
    content: `良好设计的 API 是前后端协作的基础。RESTful 风格是目前最广泛的 API 设计范式，强调资源导向和 HTTP 方法的语义化使用。

URL 设计要遵循资源层级结构，使用名词而非动词。GET 用于查询、POST 用于创建、PUT/PATCH 用于更新、DELETE 用于删除。分页、排序、过滤通过查询参数实现。

错误处理应该返回恰当的 HTTP 状态码和结构化的错误信息。统一的错误响应格式让客户端能够一致地处理错误情况。

认证推荐使用 JWT Token，通过 Authorization Header 传递。对于需要权限的接口，要在中间件层面进行统一的权限校验。

API 版本控制可以通过 URL 前缀 (/api/v1/) 或 Header 实现。字段选择、批量操作、HATEOAS 等进阶特性可以根据实际需求选用。`,
  },
  {
    slug: "seed-testing",
    title: "前端测试策略：从单元测试到 E2E",
    category: "tooling",
    tags: JSON.stringify(["testing", "tutorial"]),
    description: "构建可靠的前端应用测试体系",
    content: `前端测试是保障应用质量的关键手段。一个完整的测试策略应该覆盖单元测试、集成测试和 E2E 测试三个层次，形成测试金字塔。

单元测试是最基础也是最重要的测试层次。使用 Vitest 或 Jest 测试工具函数、组件和 hooks。React Testing Library 鼓励从用户视角测试组件行为，而非实现细节。

集成测试验证多个模块协作的正确性。对于 Next.js 应用，测试 API 路由和数据获取逻辑尤为重要。使用 MSW 模拟网络请求可以避免对真实后端的依赖。

E2E 测试使用 Playwright 模拟真实用户操作，覆盖关键用户流程。登录、注册、发布文章等核心功能都应有对应的 E2E 测试用例。

测试覆盖率不是目标而是手段。优先关注核心业务逻辑和用户流程的测试，不要盲目追求覆盖率数字。`,
  },
  {
    slug: "seed-git",
    title: "Git 高级技巧与团队协作规范",
    category: "tooling",
    tags: JSON.stringify(["git", "tutorial"]),
    description: "掌握 Git 的高级命令和团队协作最佳实践",
    content: `Git 是现代软件开发的基础工具，但大部分人只用到其 20% 的功能。掌握高级技巧能够显著提升开发效率和团队协作质量。

分支策略是团队协作的基石。GitFlow 适合有固定发布周期的项目，GitHub Flow 适合持续交付的项目。无论选择哪种策略，保持一致性是最重要的。

交互式 rebase (git rebase -i) 可以让提交历史保持整洁。可以合并、重排、修改提交记录，在 PR 审查前整理出清晰的开发脉络。

cherry-pick 用于选择性地应用特定提交到当前分支。bisect 则是调试利器，通过二分查找精确定位引入 Bug 的提交。

Git Hooks 可以在特定事件发生时触发自动化脚本。pre-commit hook 用于代码格式化检查，pre-push hook 用于运行测试。`,
  },
  {
    slug: "seed-linux",
    title: "Linux 服务器运维实战手册",
    category: "devops",
    tags: JSON.stringify(["linux"]),
    description: "日常运维必备的 Linux 命令与系统管理技巧",
    content: `Linux 是服务器领域的绝对主流。掌握 Linux 运维技能对于后端开发和 DevOps 工程师来说至关重要。

系统监控是运维的基础。top/htop 查看进程状态、df/du 检查磁盘使用、free 查看内存使用、netstat/ss 检查网络连接。结合 journalctl 查看系统日志可以快速定位问题。

进程管理方面，systemctl 管理 systemd 服务、kill 控制进程信号、nohup 和 screen 保持会话持续运行。对于资源占用异常的情况，使用 strace 和 lsof 进行诊断。

安全管理方面，sshd 配置要禁用密码登录，使用 SSH 密钥认证。ufw 或 iptables 配置防火墙规则。fail2ban 可以有效防御暴力破解攻击。

自动化运维推荐使用 Ansible，它基于 SSH 无需在目标机器安装代理，学习成本低且功能强大。`,
  },
  {
    slug: "seed-performance",
    title: "前端性能优化完整指南",
    category: "frontend",
    tags: JSON.stringify(["performance", "tutorial"]),
    description: "从网络加载到渲染优化，全面提升 Web 应用性能",
    content: `Web 性能优化直接影响用户体验和业务指标。Core Web Vitals 是 Google 衡量网页体验的核心指标，包括 LCP（最大内容绘制）、FID（首次输入延迟）和 CLS（累积布局偏移）。

网络层面的优化包括：使用 CDN 加速静态资源、启用 HTTP/2 多路复用、资源压缩 (gzip/brotli)、合理设置缓存策略。关键 CSS 可以内联到 HTML 中减少首屏渲染阻塞。

图片是页面体积的主要贡献者。使用 WebP/AVIF 格式、响应式图片 (srcset)、懒加载 (loading="lazy")、现代图片组件 (next/image) 可以显著减少传输量。

JavaScript 优化包括代码分割 (dynamic import)、Tree Shaking、懒加载非关键脚本。使用 Server Components 将渲染逻辑移到服务端可以减少客户端 JS 体积。

渲染优化方面，避免强制回流、使用 will-change 提示、合理使用虚拟列表处理大数据量。`,
  },
  {
    slug: "seed-security",
    title: "Web 安全防护实践",
    category: "security",
    tags: JSON.stringify(["security", "tutorial"]),
    description: "常见 Web 安全漏洞的原理与防御策略",
    content: `Web 安全是每个开发者都应关注的基础能力。OWASP Top 10 列出了当前最严重的 Web 安全风险，了解这些漏洞的原理和防御方法是基本功。

XSS（跨站脚本攻击）是最常见的漏洞之一。防御策略包括：输出编码 (escape)、CSP 策略、HttpOnly Cookie。对于富文本内容，使用 DOMPurify 进行清洗。

CSRF（跨站请求伪造）利用用户在已登录站点的身份发送恶意请求。SameSite Cookie 属性可以有效防御 CSRF，结合 CSRF Token 提供双重保护。

SQL 注入虽然在 ORM 普及的今天有所减少，但仍然是高危漏洞。使用参数化查询或 ORM 内置的安全方法，永远不要拼接 SQL 字符串。

认证安全方面，密码要经过 bcrypt 等强哈希函数处理，JWT 密钥要足够复杂且定期轮换，敏感信息使用 HTTPS 传输。`,
  },
  {
    slug: "seed-ai",
    title: "人工智能开发现状与工具生态",
    category: "ai-ml",
    tags: JSON.stringify(["ai", "python"]),
    description: "2026 年 AI 开发的核心工具、框架与实践",
    content: `人工智能正在深刻改变软件开发的方方面面。从代码自动生成到智能运维，AI 辅助开发已经从前沿概念变成了日常实践。

大语言模型是目前 AI 领域最热门的方向。通过 API 调用 OpenAI、Claude 等模型，开发者可以快速为应用添加智能对话、内容生成、代码理解等能力。

AI 开发工具也在快速演进。Cursor 和 Copilot 等 AI 辅助编程工具显著提升了编码效率，可以帮助开发者更快地编写和调试代码。

在数据方面，向量数据库和 RAG 架构让 AI 应用能够利用私有数据做出更准确的回答。LangChain 和 LlamaIndex 等框架简化了 AI 应用的构建流程。

对于想要深入 AI 领域的开发者，建议从 Python 和 PyTorch 入手，理解机器学习的基本概念和流程。`,
  },
  {
    slug: "seed-llm",
    title: "LLM 应用开发从入门到生产",
    category: "ai-ml",
    tags: JSON.stringify(["llm", "ai"]),
    description: "构建和部署基于大语言模型的生产级应用",
    content: `大语言模型的应用开发正在形成一套全新的技术栈。从 Prompt Engineering 到 RAG，从 Fine-tuning 到 Agent，开发者在不断探索 LLM 的能力边界。

Prompt Engineering 是 LLM 应用开发的基础。好的 Prompt 设计可以显著提升模型输出的质量和一致性。系统提示词、少样本示例、思维链等技术都是实用的 Prompt 技巧。

RAG（检索增强生成）是目前最流行的 LLM 应用架构。通过向量检索相关文档作为上下文，让模型能够基于私有知识做出回答，有效缓解了幻觉问题。

Agent 是 LLM 应用的前沿方向。通过让模型能够调用外部工具、执行代码、规划任务，可以实现更复杂的自动化工作流。

生产部署需要考虑成本控制、延迟优化、内容安全等实际问题。缓存策略、流式输出、内容过滤都是必不可少的组件。`,
  },
  {
    slug: "seed-tutorial",
    title: "如何高效学习新技术：我的方法论",
    category: "notes",
    tags: JSON.stringify(["tutorial", "心得"]),
    description: "分享我在学习编程技术过程中的经验和方法",
    content: `在技术快速迭代的今天，高效学习的能力比任何具体技术都更重要。我在多年的学习和实践中总结出了一套行之有效的学习方法。

首先是建立知识框架。不要一头扎进细节，而是先通过官方文档的快速浏览建立一个整体的知识地图。了解这个技术解决了什么问题、核心概念是什么、主要组件有哪些。

然后是动手实践。读再多的书也不如亲手写代码来得深刻。从一个小项目开始，用新技术重写一个你熟悉的旧项目，这样你可以专注在学习新工具而非业务逻辑上。

输出是最好的输入。写博客、做分享、回答社区问题，这些看似是输出活动，实际上是最高效的学习方式。写博客的过程就是整理和深化理解的过程。

最后是持续迭代。不要追求一次性学完所有内容，而是采用"够用就好"的原则，在实际项目中不断加深理解。`,
  },
  {
    slug: "seed-xinde",
    title: "程序员的成长之路：过去一年的复盘与展望",
    category: "career",
    tags: JSON.stringify(["心得"]),
    description: "回顾过去一年的技术成长与职业思考",
    content: `每年做一次技术复盘是我坚持的长期习惯。梳理过去一年的学习轨迹、项目经验和成长感悟，既能看清进步也能发现不足。

过去一年最大的收获是深入掌握了全栈开发技能。从前端的 React 生态到后端的 Node.js/Python，从数据库设计到部署运维，完整的全栈能力让我能够独立完成从想法到上线的全流程。

在技术之外，开源贡献和社区参与也带来了很多收获。通过分享知识结识了许多志同道合的开发者，开源的协作模式也让我体会到技术交流的乐趣。

展望来年，我计划在系统设计和架构能力上投入更多精力。从写好代码到设计好系统，是从优秀工程师到架构师的必经之路。

在新的一年里，希望能继续参与开源项目，输出更多有价值的技术内容，与技术社区共同成长。`,
  },
];

const stmt = sqlite.prepare(`
  INSERT INTO user_posts (title, content, description, slug, category, tags, author_id, is_published, likes_count, views_count, bookmarks_count, created_at, updated_at)
  VALUES (@title, @content, @description, @slug, @category, @tags, @author_id, @is_published, @likes_count, @views_count, @bookmarks_count, @created_at, @updated_at)
`);

let count = 0;
const insertMany = sqlite.transaction((items) => {
  for (const article of items) {
    if (existingSlugSet.has(article.slug)) {
      console.log(`   ⏭️  Skip existing: ${article.slug}`);
      continue;
    }
    stmt.run({
      title: article.title,
      content: article.content,
      description: article.description,
      slug: article.slug,
      category: article.category,
      tags: article.tags,
      author_id: authorId,
      is_published: 1,
      likes_count: Math.floor(Math.random() * 20) + 5,
      views_count: Math.floor(Math.random() * 200) + 50,
      bookmarks_count: Math.floor(Math.random() * 10) + 1,
      created_at: now,
      updated_at: now,
    });
    count++;
  }
});

insertMany(articles);

sqlite.close();

console.log(`\n✅ Done! Created ${count} new articles for weipeiluo.`);
console.log(`   Total articles now in user_posts: ${existingSlugs.length + count}`);
