import { App,  PluginSettingTab, Setting } from 'obsidian';
import { WorkflowPluginSettings } from './settings';
import WorkflowPlugin from '../main'; // 引入插件主类
import { ConfirmModal } from '../utils/modal';
import { t, type Locale } from '../utils/i18n';

export class WorkflowSettingTab extends PluginSettingTab {
    private settings: WorkflowPluginSettings;
    private saveSettings: (settings: WorkflowPluginSettings) => Promise<void>;
    private resetDefaultSettings: () => Promise<void>;
    private plugin: WorkflowPlugin;
    constructor(
        app: App, 
        plugin: WorkflowPlugin, // 接收插件实例
        saveSettings: (settings: WorkflowPluginSettings) => Promise<void>,
        resetDefaultSettings: () => Promise<void>
    ) {
        super(app, plugin); // 传递插件实例给父类
        this.plugin = plugin; // 初始化插件属性
        this.settings = plugin.settings; // 从插件实例获取 settings
        this.saveSettings = saveSettings;
        this.resetDefaultSettings = resetDefaultSettings;
    }

    display(): void {
        const {containerEl} = this;
        // 跟随 Obsidian 的语言设置
        const lang: Locale = this.plugin.getLang();

        containerEl.empty();
        new Setting(containerEl).setName(t('title.dailyNotes', lang)).setHeading();

        // 文件夹设置
        new Setting(containerEl)
            .setName(t('field.dailyFolder.name', lang))
            .setDesc(t('field.dailyFolder.desc', lang))
            .addText(text => text
                .setPlaceholder(t('placeholder.dailyFolder', lang))
                .setValue(this.settings.dailyFolder)
                .onChange((value) => {
                    this.settings.dailyFolder = value;
                    void this.saveSettings(this.settings);
                }));

        new Setting(containerEl)
            .setName(t('field.weeklyFolder.name', lang))
            .setDesc(t('field.weeklyFolder.desc', lang))
            .addText(text => text
                .setPlaceholder(t('placeholder.weeklyFolder', lang))
                .setValue(this.settings.weeklyFolder)
                .onChange((value) => {
                    this.settings.weeklyFolder = value;
                    void this.saveSettings(this.settings);
                }));

        new Setting(containerEl)
            .setName(t('field.projectFolder.name', lang))
            .setDesc(t('field.projectFolder.desc', lang))
            .addText(text => text
                .setPlaceholder(t('placeholder.projectFolder', lang))
                .setValue(this.settings.projectFolder)
                .onChange((value) => {
                    this.settings.projectFolder = value;
                    void this.saveSettings(this.settings);
                }));

        new Setting(containerEl)
            .setName(t('field.meetingFolder.name', lang))
            .setDesc(t('field.meetingFolder.desc', lang))
            .addText(text => text
                .setPlaceholder(t('placeholder.meetingFolder', lang))
                .setValue(this.settings.meetingFolder)
                .onChange((value) => {
                    this.settings.meetingFolder = value;
                    void this.saveSettings(this.settings);
                }));

        // 自动创建设置
        new Setting(containerEl)
            .setName(t('field.autoCreate.name', lang))
            .setDesc(t('field.autoCreate.desc', lang))
            .addToggle(toggle => toggle
                .setValue(this.settings.autoCreate)
                .onChange((value) => {
                    this.settings.autoCreate = value;
                    void this.saveSettings(this.settings);
                }));

        // 语言设置项已移除：插件语言将自动跟随 Obsidian 设置
        new Setting(containerEl)
        .setName(t('field.reset.name', lang))
        .setDesc(t('field.reset.desc', lang))
        .addButton(button => button
            .setButtonText(t('field.reset.button', lang))
            .setWarning()
            .onClick(() => {
                new ConfirmModal(this.app, () => {
                    void this.resetDefaultSettings().then(() => {
                        this.settings = this.plugin.settings;
                        this.display();
                    });
                }).open();
            })
        );
        // 模板设置
        new Setting(containerEl).setName(t('section.dailyTemplate', lang)).setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.dailyTemplate)
                    .onChange((value) => {
                        this.settings.dailyTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        new Setting(containerEl).setName(t('section.weeklyTemplate', lang)).setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.weeklyTemplate)
                    .onChange((value) => {
                        this.settings.weeklyTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        new Setting(containerEl).setName(t('section.projectTemplate', lang)).setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.projectTemplate)
                    .onChange((value) => {
                        this.settings.projectTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        new Setting(containerEl).setName(t('section.meetingTemplate', lang)).setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.meetingTemplate)
                    .onChange((value) => {
                        this.settings.meetingTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });
    }
}
