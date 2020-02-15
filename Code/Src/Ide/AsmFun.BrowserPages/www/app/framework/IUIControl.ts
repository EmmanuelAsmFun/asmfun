export interface IUIControl {
    ActivateControl(): void;
    DeactivateControl(): void;
    GetIsActifState(): boolean;
    GetControlGroup(): string;
}