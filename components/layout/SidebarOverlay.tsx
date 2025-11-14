'use client';

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarOverlay = ({ isOpen, onClose }: SidebarOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 bottom-0 left-[200px] right-0 bg-transparent z-40 transition-opacity"
      onClick={onClose}
      />
  );
};

export default SidebarOverlay;
