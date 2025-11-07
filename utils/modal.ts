import { Modal, App, Notice } from 'obsidian';

export class PromptModal extends Modal {
  private input: HTMLInputElement;
  private resolve: (value: string | null) => void;
  private hintEl: HTMLDivElement;
  private validate?: (value: string) => string | null;

  constructor(
    app: App,
    private message: string,
    private defaultValue: string,
    resolve: (value: string | null) => void,
    validate?: (value: string) => string | null
  ) {
    super(app);
    this.resolve = resolve;
    this.validate = validate;
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    
    titleEl.setText(this.message);
    contentEl.empty();
    
    // 创建内容容器
    const contentContainer = contentEl.createDiv({cls:'sd-modal-content-container'});
    
    this.input = contentContainer.createEl('input',{type:'text',value:this.defaultValue,cls:'sd-modal-input'});
    // 提示文字容器（用于展示校验提示，如重名）
    this.hintEl = contentContainer.createDiv({cls:'sd-modal-hint'});
    const updateHint = () => {
      const msg = this.validate ? this.validate(this.input.value.trim()) : null;
      this.hintEl.setText(msg ?? '');
      if (msg) {
        this.hintEl.addClass('error');
        this.input.addClass('error');
      } else {
        this.hintEl.removeClass('error');
        this.input.removeClass('error');
      }
    };
    this.input.addEventListener('input', updateHint);
    // 初始更新一次提示
    updateHint();
    this.input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.submit();
        }
    });
    
    // 创建按钮区域
    const footerContainer = contentEl.createDiv({cls:'sd-modal-footer-container'});    
    const cancelBtn = footerContainer.createEl('button',{text:'取消',cls:'sd-modal-cancel-btn'});
    cancelBtn.onclick = () => {
      this.resolve(null);
      this.close();
    };
    const confirmBtn = footerContainer.createEl('button',{text:'确定',cls:'sd-modal-confirm-btn'});

    confirmBtn.onclick = () => this.submit();
    this.input.focus();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private submit() {
    const value = this.input.value.trim();
    if (!value) {
      new Notice('输入不能为空');
      return;
    }
    if (this.validate) {
      const msg = this.validate(value);
      if (msg) {
        // 在输入框下方提示，并阻止提交
        this.hintEl.setText(msg);
        this.hintEl.addClass('error');
        this.input.addClass('error');
        return;
      }
    }
    this.resolve(value);
    this.close();
  }
}


export class ConfirmModal extends Modal {
  constructor(app: App, private onConfirm: () => void) {
      super(app);
  }

  onOpen() {
      const {contentEl} = this;
      contentEl.setText('确定要恢复所有设置为默认值吗？');
      
      // 创建按钮容器
      const buttonContainer = contentEl.createDiv({cls: 'modal-button-container'});
      
      // 创建取消按钮
      buttonContainer.createEl('button', {text: '取消'}).onclick = () => {
          this.close();
      };
      
      // 创建确认按钮
      buttonContainer.createEl('button', {text: '确认', cls: 'mod-cta'}).onclick = () => {
          this.onConfirm();
          this.close();
      };
  }

  onClose() {
      const {contentEl} = this;
      contentEl.empty();
  }
}