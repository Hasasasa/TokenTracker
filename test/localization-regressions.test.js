const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(relPath) {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

test("zh locale keeps CLI subcommands executable", () => {
  const dashboardCopy = read("dashboard/src/content/i18n/zh/dashboard.json");

  assert.match(
    dashboardCopy,
    /"dashboard\.install\.cmd\.init":\s*"npx --yes tokentracker-cli init"/,
    "expected zh install init command to keep the init subcommand",
  );
  assert.match(
    dashboardCopy,
    /"dashboard\.install\.cmd\.sync":\s*"npx --yes tokentracker-cli sync"/,
    "expected zh sync command to keep the sync subcommand",
  );
  assert.match(
    dashboardCopy,
    /"dashboard\.upgrade_alert\.install_command":\s*"npx --yes tokentracker-cli init"/,
    "expected zh upgrade alert command to keep the init subcommand",
  );
  assert.doesNotMatch(dashboardCopy, /tokentracker-cli (初始化|同步)/);
});

test("native macOS defaults stay English until Swift localization exists", () => {
  const strings = read("TokenTrackerBar/TokenTrackerBar/Utilities/Strings.swift");
  const dateHelpers = read("TokenTrackerBar/TokenTrackerBar/Utilities/DateHelpers.swift");
  const clawdCompanion = read("TokenTrackerBar/TokenTrackerBar/Views/ClawdCompanionView.swift");
  const sharedWidgetViews = read("TokenTrackerBar/TokenTrackerWidget/Views/SharedWidgetViews.swift");
  const summaryWidget = read("TokenTrackerBar/TokenTrackerWidget/Widgets/SummaryWidget.swift");
  const heatmapWidget = read("TokenTrackerBar/TokenTrackerWidget/Widgets/HeatmapWidget.swift");
  const topModelsWidget = read("TokenTrackerBar/TokenTrackerWidget/Widgets/TopModelsWidget.swift");
  const usageLimitsWidget = read("TokenTrackerBar/TokenTrackerWidget/Widgets/UsageLimitsWidget.swift");

  assert.ok(strings.includes('static let serverUnavailable = "Server Unavailable"'));
  assert.ok(strings.includes('static let menuSyncNow = "Sync Now"'));
  assert.ok(strings.includes('static let todayTitle = "Today"'));
  assert.ok(strings.includes('static let menuTokenLabel = "Tokens"'));
  assert.ok(strings.includes('static let menuCostLabel = "Cost"'));
  assert.ok(!strings.includes('static let serverUnavailable = "服务不可用"'));

  assert.ok(dateHelpers.includes('case .day:   return "Day"'));
  assert.ok(dateHelpers.includes('case .total: return "Total"'));

  assert.ok(clawdCompanion.includes('"Syncing usage data"'));
  assert.ok(clawdCompanion.includes('"👆 Tap me for more!"'));
  assert.ok(clawdCompanion.includes('"📊 Today: \\(f) tokens"'));

  assert.ok(sharedWidgetViews.includes('Text("Updated \\(WidgetFormat.relativeUpdated(updated))")'));

  assert.ok(summaryWidget.includes('.configurationDisplayName("Usage")'));
  assert.ok(summaryWidget.includes('Text("TODAY")'));
  assert.ok(summaryWidget.includes('Text("vs. yesterday")'));

  assert.ok(heatmapWidget.includes('.configurationDisplayName("Activity Heatmap")'));
  assert.ok(heatmapWidget.includes('Text("\\(streak)d streak")'));
  assert.ok(heatmapWidget.includes('Text("tokens · \\(snap.heatmap.activeDays) active days")'));

  assert.ok(topModelsWidget.includes('.configurationDisplayName("Top Models")'));
  assert.ok(topModelsWidget.includes('WidgetEmptyState(message: "No model usage yet")'));

  assert.ok(usageLimitsWidget.includes('.configurationDisplayName("Usage Limits")'));
  assert.ok(usageLimitsWidget.includes('WidgetEmptyState(message: "No configured providers")'));
});

test("locale PR stays scoped away from silent auto update flags", () => {
  const app = read("TokenTrackerBar/TokenTrackerBar/TokenTrackerBarApp.swift");
  const plist = read("TokenTrackerBar/TokenTrackerBar/Info.plist");
  const project = read("TokenTrackerBar/project.yml");

  assert.ok(app.includes("UpdateChecker.shared.check(silent: true)"));
  assert.doesNotMatch(app, /TokenTrackerEnableSilentAutoUpdate|isSilentAutoUpdateEnabled/);
  assert.doesNotMatch(plist, /TokenTrackerEnableSilentAutoUpdate/);
  assert.doesNotMatch(project, /TokenTrackerEnableSilentAutoUpdate/);
});

test("zh locale uses reviewed natural copy for settings and dashboard", () => {
  const core = read("dashboard/src/content/i18n/zh/core.json");
  const dashboard = read("dashboard/src/content/i18n/zh/dashboard.json");

  assert.match(core, /"header\.cloud_sync\.hint":\s*"运行本地 Token Tracker 同步，将用量上传到云端。关闭后仅保留本地离线使用。"/);
  assert.match(core, /"identity_card\.rank_label":\s*"排名"/);
  assert.match(core, /"identity_panel\.rank_label":\s*"排名"/);
  assert.match(core, /"widgets\.heatmap\.description":\s*"像 GitHub 一样，一眼看清活跃和空闲的日子。"/);
  assert.match(core, /"widgets\.topModels\.name":\s*"热门模型"/);
  assert.match(core, /"daily\.sort\.conversations\.label":\s*"对话数"/);
  assert.match(core, /"settings\.account\.githubUrl":\s*"GitHub 主页"/);
  assert.match(dashboard, /"dashboard\.top_models\.title":\s*"热门模型"/);
  assert.match(dashboard, /"dashboard\.public_view\.status\.disabled":\s*"关闭"/);
  assert.match(dashboard, /"dashboard\.screenshot\.title_line2":\s*"2025 年度回顾"/);

  assert.doesNotMatch(core, /顶级模特|转化次数|InsForge 可以摄取您的队列|斑点条纹和安静的日子一目了然/);
  assert.doesNotMatch(dashboard, /型号分解|动态的|复制的|编码剂|2025 包裹/);
});
