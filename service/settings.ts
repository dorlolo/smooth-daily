export interface WorkflowPluginSettings {
    dailyFolder: string;
    weeklyFolder: string;
    projectFolder: string;
    meetingFolder: string;
    autoCreate: boolean;
    autoCreateTime: string;
    dateFormat: string;
    language: string;
    dailyTemplate: string;
    weeklyTemplate: string;
    projectTemplate: string;
    meetingTemplate: string;
}
import type { Locale } from '../utils/i18n';

function zhTemplates() {
  return {
    dailyTemplate: `---
tags:
  - daily
  - {{date_year}}-W{{week}}
date: "{{date}}"
week: "W{{week}}"
weekDay: "{{weekday}}"
---

# 每周任务
![[workFlow/weekly/{{date_year}}-w{{week}}#主要任务]]

# 当日工作代办 
{{incomplete_work}}

# 当日个人代办
{{incomplete_personal}} `,
    weeklyTemplate: `---
tags:
  - weekly
  - {{date_year}}-{{date_month}}
  - W{{week}}
---

# 主要任务
`,
    projectTemplate: `---
aliases: 
  - "{{project_name}}"
tags:
  - project
date: "{{date}}"
status: active
---

## 项目资料


## 主要任务


## 相关文件


## 会议记录

`,
    meetingTemplate: `---
tags:
  - meeting
date: "{{date}}"
time: "{{time}}"
links: {{relatedFile}}
---

# {{meeting_name}}

## 会议目标


## 会议内容
1. 
2. 

## 会议决议

`
  };
}

function enTemplates() {
  return {
    dailyTemplate: `---
tags:
  - daily
  - {{date_year}}-W{{week}}
date: "{{date}}"
week: "W{{week}}"
weekDay: "{{weekday}}"
---

# Weekly tasks
![[workFlow/weekly/{{date_year}}-w{{week}}#Main tasks]]

# Work todos today
{{incomplete_work}}

# Personal todos today
{{incomplete_personal}} `,
    weeklyTemplate: `---
tags:
  - weekly
  - {{date_year}}-{{date_month}}
  - W{{week}}
---

# Main tasks
`,
    projectTemplate: `---
aliases: 
  - "{{project_name}}"
tags:
  - project
date: "{{date}}"
status: active
---

## Project references


## Main tasks


## Related files


## Meeting notes

`,
    meetingTemplate: `---
tags:
  - meeting
date: "{{date}}"
time: "{{time}}"
links: {{relatedFile}}
---

# {{meeting_name}}

## Meeting goals


## Discussion
1. 
2. 

## Decisions

`
  };
}

function getSystemLocale(plugin: import('../main').default): Locale {
  const appObj = plugin.app as unknown as { i18n?: { language?: string }; vault?: { config?: { locale?: string } } };
  const raw: string | undefined = appObj?.i18n?.language || appObj?.vault?.config?.locale || (typeof window !== 'undefined' ? (window.localStorage?.getItem('language') || window.localStorage?.getItem('obsidianLanguage') || undefined) : undefined);
  return raw && raw.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export const DEFAULT_SETTINGS: WorkflowPluginSettings = {
    dailyFolder: 'workFlow/daily',
    weeklyFolder: 'workFlow/weekly',
    projectFolder: 'workFlow/projects',
    meetingFolder: 'workFlow/meetings',
    autoCreate: true,
    autoCreateTime: '00:00',
    dateFormat: 'YYYY-MM-DD',
    language: 'zh',
    // 默认使用中文模板；实际加载与重置时按系统语言覆盖
    ...zhTemplates()
};

import WorkflowPlugin from '../main'; // 引入你的插件主类

export class SettingsManager {
    constructor(private plugin: WorkflowPlugin) {} // 指定为你的自定义插件类型

    async loadSettings(): Promise<WorkflowPluginSettings> {
        const stored = await this.plugin.loadData();
        const locale = getSystemLocale(this.plugin);
        const localized = locale === 'zh' ? zhTemplates() : enTemplates();
        // 合并：语言字段保留（为兼容旧数据），模板按系统语言默认值填充
        return Object.assign({}, DEFAULT_SETTINGS, localized, stored);
    }

    async saveSettings(settings: WorkflowPluginSettings): Promise<void> {
        await this.plugin.saveData(settings);
    }
    
    async resetToDefaults(): Promise<void> {
      const locale = getSystemLocale(this.plugin);
      const localized = locale === 'zh' ? zhTemplates() : enTemplates();
      this.plugin.settings = { ...DEFAULT_SETTINGS, ...localized };
      await this.plugin.saveData(this.plugin.settings);
    }
}
