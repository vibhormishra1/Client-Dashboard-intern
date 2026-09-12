import { PrismaClient, Role, TaskStatus, TaskPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const password = await bcrypt.hash('password123', 10);

  // ═══════════════════════════════════════
  // USERS (7 as per PRD)
  // ═══════════════════════════════════════

  const admin = await prisma.user.upsert({
    where: { email: 'admin@velozity.com' },
    update: {},
    create: { email: 'admin@velozity.com', name: 'System Admin', password, role: Role.ADMIN },
  });

  const pm1 = await prisma.user.upsert({
    where: { email: 'pm1@velozity.com' },
    update: {},
    create: { email: 'pm1@velozity.com', name: 'Priya Mehta', password, role: Role.PM },
  });

  const pm2 = await prisma.user.upsert({
    where: { email: 'pm2@velozity.com' },
    update: {},
    create: { email: 'pm2@velozity.com', name: 'Arjun Kapoor', password, role: Role.PM },
  });

  const dev1 = await prisma.user.upsert({
    where: { email: 'dev1@velozity.com' },
    update: {},
    create: { email: 'dev1@velozity.com', name: 'Ravi Kumar', password, role: Role.DEVELOPER },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: 'dev2@velozity.com' },
    update: {},
    create: { email: 'dev2@velozity.com', name: 'Sneha Sharma', password, role: Role.DEVELOPER },
  });

  const dev3 = await prisma.user.upsert({
    where: { email: 'dev3@velozity.com' },
    update: {},
    create: { email: 'dev3@velozity.com', name: 'Vikram Joshi', password, role: Role.DEVELOPER },
  });

  const dev4 = await prisma.user.upsert({
    where: { email: 'dev4@velozity.com' },
    update: {},
    create: { email: 'dev4@velozity.com', name: 'Anita Patel', password, role: Role.DEVELOPER },
  });

  console.log('✅ 7 users created');

  // ═══════════════════════════════════════
  // CLIENTS
  // ═══════════════════════════════════════

  const acme = await prisma.client.create({
    data: { name: 'Acme Corp', email: 'contact@acme.com', createdById: admin.id },
  });

  const retailx = await prisma.client.create({
    data: { name: 'RetailX', email: 'hello@retailx.com', createdById: admin.id },
  });

  const buildco = await prisma.client.create({
    data: { name: 'BuildCo', email: 'info@buildco.com', createdById: admin.id },
  });

  console.log('✅ 3 clients created');

  // ═══════════════════════════════════════
  // PROJECTS (3 as per PRD)
  // ═══════════════════════════════════════

  const project1 = await prisma.project.create({
    data: {
      name: 'Fintech Dashboard Redesign',
      description: 'Complete UI/UX overhaul of the client-facing fintech dashboard',
      clientId: acme.id,
      createdById: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'E-commerce Mobile App',
      description: 'Native mobile app for RetailX e-commerce platform',
      clientId: retailx.id,
      createdById: pm2.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Internal HR Tool',
      description: 'Employee management and payroll system',
      clientId: buildco.id,
      createdById: pm1.id,
    },
  });

  console.log('✅ 3 projects created');

  // ═══════════════════════════════════════
  // TASKS (5+ per project, varied statuses)
  // ═══════════════════════════════════════

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const inTenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

  // Project 1 tasks (Fintech Dashboard)
  const tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Design new dashboard wireframes', description: 'Create Figma wireframes for the redesigned dashboard', projectId: project1.id, assignedToId: dev1.id, createdById: pm1.id, status: TaskStatus.DONE, priority: TaskPriority.HIGH, dueDate: threeDaysAgo } }),
    prisma.task.create({ data: { title: 'Implement auth flow', description: 'Build login/register/forgot-password screens', projectId: project1.id, assignedToId: dev2.id, createdById: pm1.id, status: TaskStatus.IN_REVIEW, priority: TaskPriority.CRITICAL, dueDate: inFiveDays } }),
    prisma.task.create({ data: { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for auto-deploy', projectId: project1.id, assignedToId: dev1.id, createdById: pm1.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, dueDate: inTenDays } }),
    prisma.task.create({ data: { title: 'API integration layer', description: 'Build typed API client with Axios interceptors', projectId: project1.id, assignedToId: dev2.id, createdById: pm1.id, status: TaskStatus.TO_DO, priority: TaskPriority.HIGH, dueDate: inTenDays } }),
    prisma.task.create({ data: { title: 'Write unit tests', description: 'Jest + React Testing Library for core components', projectId: project1.id, assignedToId: dev1.id, createdById: pm1.id, status: TaskStatus.TO_DO, priority: TaskPriority.LOW, dueDate: inTenDays } }),
    // OVERDUE task
    prisma.task.create({ data: { title: 'Fix chart rendering bug', description: 'Charts not rendering on Safari — investigate canvas fallback', projectId: project1.id, assignedToId: dev2.id, createdById: pm1.id, status: TaskStatus.OVERDUE, priority: TaskPriority.CRITICAL, dueDate: threeDaysAgo } }),

    // Project 2 tasks (E-commerce App)
    prisma.task.create({ data: { title: 'Setup React Native project', description: 'Initialize RN project with TypeScript template', projectId: project2.id, assignedToId: dev3.id, createdById: pm2.id, status: TaskStatus.DONE, priority: TaskPriority.HIGH, dueDate: threeDaysAgo } }),
    prisma.task.create({ data: { title: 'Product listing screen', description: 'Implement infinite scroll product grid', projectId: project2.id, assignedToId: dev3.id, createdById: pm2.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: inFiveDays } }),
    prisma.task.create({ data: { title: 'Shopping cart logic', description: 'Zustand store for cart with persistence', projectId: project2.id, assignedToId: dev4.id, createdById: pm2.id, status: TaskStatus.TO_DO, priority: TaskPriority.MEDIUM, dueDate: inTenDays } }),
    prisma.task.create({ data: { title: 'Payment gateway integration', description: 'Stripe SDK integration for checkout', projectId: project2.id, assignedToId: dev4.id, createdById: pm2.id, status: TaskStatus.TO_DO, priority: TaskPriority.CRITICAL, dueDate: inTenDays } }),
    prisma.task.create({ data: { title: 'Push notifications', description: 'Firebase Cloud Messaging setup', projectId: project2.id, assignedToId: dev3.id, createdById: pm2.id, status: TaskStatus.TO_DO, priority: TaskPriority.LOW, dueDate: inTenDays } }),
    // OVERDUE task
    prisma.task.create({ data: { title: 'Fix login crash on Android', description: 'App crashes on Android 12 during OAuth flow', projectId: project2.id, assignedToId: dev4.id, createdById: pm2.id, status: TaskStatus.OVERDUE, priority: TaskPriority.CRITICAL, dueDate: threeDaysAgo } }),

    // Project 3 tasks (HR Tool)
    prisma.task.create({ data: { title: 'Database schema design', description: 'Design PostgreSQL schema for employees, departments, payroll', projectId: project3.id, assignedToId: dev1.id, createdById: pm1.id, status: TaskStatus.DONE, priority: TaskPriority.HIGH, dueDate: threeDaysAgo } }),
    prisma.task.create({ data: { title: 'Employee CRUD API', description: 'RESTful endpoints for employee management', projectId: project3.id, assignedToId: dev2.id, createdById: pm1.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: inFiveDays } }),
    prisma.task.create({ data: { title: 'Payroll calculation engine', description: 'Tax brackets, deductions, and net pay calculator', projectId: project3.id, assignedToId: dev1.id, createdById: pm1.id, status: TaskStatus.TO_DO, priority: TaskPriority.CRITICAL, dueDate: inTenDays } }),
    prisma.task.create({ data: { title: 'Leave management module', description: 'Apply/approve/reject leave requests', projectId: project3.id, assignedToId: dev2.id, createdById: pm1.id, status: TaskStatus.TO_DO, priority: TaskPriority.MEDIUM, dueDate: inTenDays } }),
    prisma.task.create({ data: { title: 'Admin reporting dashboard', description: 'Charts and KPIs for HR admins', projectId: project3.id, assignedToId: dev1.id, createdById: pm1.id, status: TaskStatus.TO_DO, priority: TaskPriority.LOW, dueDate: inTenDays } }),
  ]);

  console.log(`✅ ${tasks.length} tasks created (including 2 OVERDUE)`);

  // ═══════════════════════════════════════
  // ACTIVITY LOGS (10+ pre-seeded)
  // ═══════════════════════════════════════

  await prisma.activityLog.createMany({
    data: [
      { taskId: tasks[0]!.id, projectId: project1.id, userId: dev1.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Ravi started working on wireframes' },
      { taskId: tasks[0]!.id, projectId: project1.id, userId: dev1.id, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', message: 'Ravi completed dashboard wireframes' },
      { taskId: tasks[1]!.id, projectId: project1.id, userId: dev2.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Sneha started auth flow implementation' },
      { taskId: tasks[1]!.id, projectId: project1.id, userId: dev2.id, fromStatus: 'IN_PROGRESS', toStatus: 'IN_REVIEW', message: 'Sneha submitted auth flow for review' },
      { taskId: tasks[2]!.id, projectId: project1.id, userId: dev1.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Ravi started CI/CD pipeline setup' },
      { taskId: tasks[6]!.id, projectId: project2.id, userId: dev3.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Vikram started React Native project setup' },
      { taskId: tasks[6]!.id, projectId: project2.id, userId: dev3.id, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', message: 'Vikram completed RN project initialization' },
      { taskId: tasks[7]!.id, projectId: project2.id, userId: dev3.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Vikram started product listing screen' },
      { taskId: tasks[12]!.id, projectId: project3.id, userId: dev1.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Ravi started database schema design' },
      { taskId: tasks[12]!.id, projectId: project3.id, userId: dev1.id, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', message: 'Ravi completed HR database schema' },
      { taskId: tasks[13]!.id, projectId: project3.id, userId: dev2.id, fromStatus: 'TO_DO', toStatus: 'IN_PROGRESS', message: 'Sneha started Employee CRUD API' },
      { taskId: tasks[5]!.id, projectId: project1.id, userId: dev2.id, fromStatus: 'IN_PROGRESS', toStatus: 'OVERDUE', message: 'Chart rendering bug marked as overdue' },
    ],
  });

  console.log('✅ 12 activity logs created');

  // ═══════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════

  await prisma.notification.createMany({
    data: [
      { recipientId: dev1.id, message: 'You have been assigned to "Design new dashboard wireframes"', type: NotificationType.TASK_ASSIGNED, taskId: tasks[0]!.id },
      { recipientId: dev2.id, message: 'You have been assigned to "Implement auth flow"', type: NotificationType.TASK_ASSIGNED, taskId: tasks[1]!.id },
      { recipientId: pm1.id, message: 'Task "Implement auth flow" has been moved to In Review', type: NotificationType.TASK_IN_REVIEW, taskId: tasks[1]!.id },
      { recipientId: dev3.id, message: 'You have been assigned to "Product listing screen"', type: NotificationType.TASK_ASSIGNED, taskId: tasks[7]!.id },
      { recipientId: dev4.id, message: 'You have been assigned to "Shopping cart logic"', type: NotificationType.TASK_ASSIGNED, taskId: tasks[8]!.id },
    ],
  });

  console.log('✅ 5 notifications created');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Test accounts:');
  console.log('  admin@velozity.com    / password123  (ADMIN)');
  console.log('  pm1@velozity.com      / password123  (PM)');
  console.log('  pm2@velozity.com      / password123  (PM)');
  console.log('  dev1@velozity.com     / password123  (DEVELOPER)');
  console.log('  dev2@velozity.com     / password123  (DEVELOPER)');
  console.log('  dev3@velozity.com     / password123  (DEVELOPER)');
  console.log('  dev4@velozity.com     / password123  (DEVELOPER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
