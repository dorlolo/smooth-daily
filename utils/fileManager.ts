import { App, TFile, TFolder ,MarkdownView} from 'obsidian';
import { WorkflowPluginSettings } from '../service/settings';

export class FileManager {
    constructor(private app: App, private settings: WorkflowPluginSettings) {}

    async ensureFolderExists(folderPath: string): Promise<void> {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder) {
            await this.app.vault.createFolder(folderPath);
        } else if (!(folder instanceof TFolder)) {
            throw new Error(`路径 ${folderPath} 不是文件夹`);
        }
    }

    async openFile(file: TFile): Promise<void> {
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.openFile(file);
    }
    
    // 查找当前日期之前最近的日记文件
    getLatestDailyFileBefore(date: Date): TFile | null {
        try {
            const folder = this.app.vault.getAbstractFileByPath(this.settings.dailyFolder);
            if (!folder || !(folder instanceof TFolder)) {
                return null;
            }
            const files = folder.children.filter((f): f is TFile => f instanceof TFile);
            const candidates = files
                .map(file => {
                    const match = file.name.match(/^(\d{4})-(\d{2})-(\d{2})_/);
                    if (!match) return null;
                    const d = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
                    return { file, date: d };
                })
                .filter((x): x is { file: TFile; date: Date } => !!x)
                .filter(x => x.date.getTime() < date.getTime())
                .sort((a, b) => b.date.getTime() - a.date.getTime());
            return candidates.length ? candidates[0].file : null;
        } catch (error) {
            console.error('查找最近的日记文件时出错:', error);
            return null;
        }
    }

    // 列出项目名称与索引文件
    listProjects(): { name: string; indexFile: TFile | null }[] {
        try {
            const folder = this.app.vault.getAbstractFileByPath(this.settings.projectFolder);
            if (!folder || !(folder instanceof TFolder)) return [];
            const subfolders = folder.children.filter((f): f is TFolder => f instanceof TFolder);
            const projects = subfolders.map(sf => {
                const name = sf.name;
                const indexPath = `${this.settings.projectFolder}/${name}/${name}-index.md`;
                const index = this.app.vault.getAbstractFileByPath(indexPath);
                return { name, indexFile: index instanceof TFile ? index : null };
            });
            return projects;
        } catch (error) {
            console.error('列出项目时出错:', error);
            return [];
        }
    }

    // 按项目名查找索引文件
    findProjectIndexFile(name: string): TFile | null {
        const indexPath = `${this.settings.projectFolder}/${name}/${name}-index.md`;
        const index = this.app.vault.getAbstractFileByPath(indexPath);
        return index instanceof TFile ? index : null;
    }

    // 在指定标题下追加一行，若标题不存在则追加到末尾
    async appendLineUnderHeading(file: TFile, heading: string, line: string): Promise<void> {
        const content = await this.app.vault.read(file);
        const lines = content.split('\n');
        const headingIndex = lines.findIndex(l => l.trim() === heading.trim());
        if (headingIndex >= 0) {
            // 插入到标题之后一行
            lines.splice(headingIndex + 1, 0, line);
            const updated = lines.join('\n');
            await this.app.vault.modify(file, updated);
        } else {
            const updated = `${content}\n${line}`;
            await this.app.vault.modify(file, updated);
        }
    }
    // 解析文件中未完成的任务
    async getIncompleteTasks(filePath: string): Promise<string[]> {
        try {
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (!file ||!(file instanceof TFile)) {
                return [];
            }
            const content = await this.app.vault.read(file);
            const incompleteTasks = content.split('\n')
                .filter(line => line.trim().startsWith('- [ ]'))
                .map(line => line.trim());
            
            return incompleteTasks;
        } catch (error) {
        console.error('解析未完成任务时出错:', error);
        return [];
        }
    }
    // 解析文件中不同类型的未完成任务
    async getIncompleteTasksByType(filePath: string): Promise<{ work: string[]; personal: string[] }> {
        try {
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (!file ||!(file instanceof TFile)) {
                return { work: [], personal: [] };
            }
            if (!file) return { work: [], personal: [] };
            
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            
            const workTasks: string[] = [];
            const personalTasks: string[] = [];
            let currentSection = '';
        
            // 任务分类标题（可从设置中获取）
            const workSectionTitle = '# 当日工作代办';
            const personalSectionTitle = '# 当日个人代办';
            
            for (const line of lines) {
                if (line.trim() === workSectionTitle) {
                    currentSection = 'work';
                    continue;
                }
                
                if (line.trim() === personalSectionTitle) {
                    currentSection = 'personal';
                    continue;
                }
                
                // 提取未完成任务
                if (line.trim().startsWith('- [ ]')) {
                if (currentSection === 'work') workTasks.push(line.trim());
                if (currentSection === 'personal') personalTasks.push(line.trim());
                }
            }
        
            return { work: workTasks, personal: personalTasks };
        } catch (error) {
            console.error('解析未完成任务时出错:', error);
            return { work: [], personal: [] };
        }
    }

    // 解析文件中的未完成任务与附加记录（位于当日工作/个人代办段落下方）
    async getTasksAndRecordsByType(filePath: string): Promise<{ 
        workTasks: string[]; 
        personalTasks: string[]; 
        workRecords: string[]; 
        personalRecords: string[]; 
    }> {
        try {
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (!file || !(file instanceof TFile)) {
                return { workTasks: [], personalTasks: [], workRecords: [], personalRecords: [] };
            }
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');

            const workTasks: string[] = [];
            const personalTasks: string[] = [];
            const workRecords: string[] = [];
            const personalRecords: string[] = [];
            let currentSection: '' | 'work' | 'personal' = '';

            const workSectionTitle = '# 当日工作代办';
            const personalSectionTitle = '# 当日个人代办';

            for (const raw of lines) {
                const line = raw.trimEnd();
                const trimmed = line.trim();

                if (trimmed === workSectionTitle) { currentSection = 'work'; continue; }
                if (trimmed === personalSectionTitle) { currentSection = 'personal'; continue; }

                // 遇到新的标题，结束当前段落的记录收集
                if (trimmed.startsWith('# ')) {
                    currentSection = '';
                    continue;
                }

                if (currentSection === 'work') {
                    if (trimmed.startsWith('- [ ]')) {
                        workTasks.push(trimmed);
                    } else if (trimmed.length > 0 && !trimmed.startsWith('---')) {
                        workRecords.push(line); // 保留行尾空格与缩进
                    }
                } else if (currentSection === 'personal') {
                    if (trimmed.startsWith('- [ ]')) {
                        personalTasks.push(trimmed);
                    } else if (trimmed.length > 0 && !trimmed.startsWith('---')) {
                        personalRecords.push(line);
                    }
                }
            }

            return { workTasks, personalTasks, workRecords, personalRecords };
        } catch (error) {
            console.error('解析未完成任务与记录时出错:', error);
            return { workTasks: [], personalTasks: [], workRecords: [], personalRecords: [] };
        }
    }

    // 提取工作/个人段落内需要继承的内容（保留原顺序：未完成任务 + 普通记录）
    async getSectionContentByType(filePath: string): Promise<{ 
        work: string[]; 
        personal: string[]; 
    }> {
        try {
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (!file || !(file instanceof TFile)) {
                return { work: [], personal: [] };
            }
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');

            const work: string[] = [];
            const personal: string[] = [];
            let currentSection: '' | 'work' | 'personal' = '';

            const workSectionTitle = '# 当日工作代办';
            const personalSectionTitle = '# 当日个人代办';

            const isCompletedTask = (l: string) => /^\s*- \[x\]/i.test(l.trim());

            for (const raw of lines) {
                const line = raw; // 保留原格式（包含空行、缩进）
                const trimmed = raw.trim();

                if (trimmed === workSectionTitle) { currentSection = 'work'; continue; }
                if (trimmed === personalSectionTitle) { currentSection = 'personal'; continue; }

                // 遇到新的标题则结束当前段落
                if (trimmed.startsWith('# ')) { currentSection = ''; continue; }

                if (!currentSection) continue;

                // 过滤掉已完成任务，其余（未完成任务或普通记录）保留
                if (isCompletedTask(line)) {
                    continue;
                }

                if (currentSection === 'work') {
                    work.push(line);
                } else if (currentSection === 'personal') {
                    personal.push(line);
                }
            }

            // 去除段落尾部多余的空行（美化）
            const trimTail = (arr: string[]) => {
                let i = arr.length - 1;
                while (i >= 0 && arr[i].trim() === '') i--;
                return arr.slice(0, i + 1);
            };

            return { work: trimTail(work), personal: trimTail(personal) };
        } catch (error) {
            console.error('解析段落内容（任务+记录）时出错:', error);
            return { work: [], personal: [] };
        }
    }

    // 生成Obsidian文件链接
    generateObsLink = (file: TFile) => {
        return `"[[`+this.app.metadataCache.fileToLinktext(file,"")+`]]"`;
    };


    //获取选中的文件内容
    getActiveFileSelection(): string | null {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          return activeView.editor.getSelection();
        }
        return null;
    }
}
