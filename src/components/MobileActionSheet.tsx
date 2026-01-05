import { Radio, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (e?: React.MouseEvent) => void | Promise<void>;
  color?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actions: ActionItem[];
  poster?: string;
  sources?: string[]; // 播放源信息
  isAggregate?: boolean; // 是否为聚合内容
  sourceName?: string; // 播放源名称
  currentEpisode?: number; // 当前集数
  totalEpisodes?: number; // 总集数
  origin?: 'vod' | 'live';
}

const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  actions,
  poster,
  sources,
  isAggregate,
  sourceName,
  currentEpisode,
  totalEpisodes,
  origin = 'vod',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 控制动画状态
  useEffect(() => {
    let animationId: number;
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setIsVisible(true);
      // 使用双重 requestAnimationFrame 确保DOM完全渲染
      animationId = requestAnimationFrame(() => {
        animationId = requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // 等待动画完成后隐藏组件
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen]);

  // 阻止背景滚动
  useEffect(() => {
    if (isVisible) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const body = document.body;
      const html = document.documentElement;

      // 获取滚动条宽度
      const scrollBarWidth = window.innerWidth - html.clientWidth;

      // 保存原始样式
      const originalBodyStyle = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        paddingRight: body.style.paddingRight,
        overflow: body.style.overflow,
      };

      // 设置body样式来阻止滚动，但保持原位置
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = `-${scrollX}px`;
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollBarWidth}px`;

      return () => {
        // 恢复所有原始样式
        body.style.position = originalBodyStyle.position;
        body.style.top = originalBodyStyle.top;
        body.style.left = originalBodyStyle.left;
        body.style.right = originalBodyStyle.right;
        body.style.width = originalBodyStyle.width;
        body.style.paddingRight = originalBodyStyle.paddingRight;
        body.style.overflow = originalBodyStyle.overflow;

        // 使用 requestAnimationFrame 确保样式恢复后再滚动
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY);
        });
      };
    }
  }, [isVisible]);

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getActionColor = (color: ActionItem['color']) => {
    switch (color) {
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'primary':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getActionHoverColor = (color: ActionItem['color']) => {
    switch (color) {
      case 'danger':
        return 'hover:bg-red-50/50 dark:hover:bg-red-900/10';
      case 'primary':
        return 'hover:bg-green-50/50 dark:hover:bg-green-900/10';
      default:
        return 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20';
    }
  };

  return (
    <>
      {/* 全屏透明遮罩 - 点击关闭 */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault()}
        style={{
          willChange: 'opacity',
          touchAction: 'none',
        }}
      />

      {/* 操作菜单 - 底部居中 */}
      <div
        className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl transition-all duration-300 ease-out'
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: isAnimating
            ? 'translateX(-50%) translateY(0) translateZ(0)'
            : 'translateX(-50%) translateY(calc(100% + 2rem)) translateZ(0)',
          opacity: isAnimating ? 1 : 0,
          touchAction: 'auto',
        }}
      >
        {/* 头部 */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            {poster && (
              <div className='relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0'>
                <Image
                  src={poster}
                  alt={title}
                  fill
                  className={
                    origin === 'live' ? 'object-contain' : 'object-cover'
                  }
                  loading='lazy'
                />
              </div>
            )}
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 truncate'>
                  {title}
                </h3>
                {sourceName && (
                  <span className='flex-shrink-0 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                    {origin === 'live' && (
                      <Radio
                        size={12}
                        className='inline-block text-gray-500 dark:text-gray-400 mr-1.5'
                      />
                    )}
                    {sourceName}
                  </span>
                )}
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                选择操作
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150'
          >
            <X size={20} className='text-gray-500 dark:text-gray-400' />
          </button>
        </div>

        {/* 操作列表 */}
        <div className='px-4 py-2'>
          {actions.map((action, index) => (
            <div key={action.id}>
              <button
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                disabled={action.disabled}
                className={`
                  w-full flex items-center gap-4 py-4 px-2 transition-all duration-150 ease-out
                  ${
                    action.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : `${getActionHoverColor(action.color)} active:scale-[0.98]`
                  }
                `}
                style={{ willChange: 'transform, background-color' }}
              >
                {/* 图标 - 使用线条风格 */}
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <span
                    className={`transition-colors duration-150 ${
                      action.disabled
                        ? 'text-gray-400 dark:text-gray-600'
                        : getActionColor(action.color)
                    }`}
                  >
                    {action.icon}
                  </span>
                </div>

                {/* 文字 */}
                <span
                  className={`
                  text-left font-medium text-base flex-1
                  ${
                    action.disabled
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-900 dark:text-gray-100'
                  }
                `}
                >
                  {action.label}
                </span>

                {/* 播放进度 - 只在播放按钮且有播放记录时显示 */}
                {action.id === 'play' && currentEpisode && totalEpisodes && (
                  <span className='text-sm text-gray-500 dark:text-gray-400 font-medium'>
                    {currentEpisode}/{totalEpisodes}
                  </span>
                )}
              </button>

              {/* 分割线 - 最后一项不显示 */}
              {index < actions.length - 1 && (
                <div className='border-b border-gray-100 dark:border-gray-800 ml-10'></div>
              )}
            </div>
          ))}
        </div>

        {/* 播放源信息展示区域 */}
        {isAggregate && sources && sources.length > 0 && (
          <div className='px-4 py-3 border-t border-gray-100 dark:border-gray-800'>
            {/* 标题区域 */}
            <div className='mb-3'>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-1'>
                可用播放源
              </h4>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                共 {sources.length} 个播放源
              </p>
            </div>

            {/* 播放源列表 */}
            <div className='max-h-32 overflow-y-auto'>
              <div className='grid grid-cols-2 gap-2'>
                {sources.map((source, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30'
                  >
                    <div className='w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0' />
                    <span className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                      {source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileActionSheet;
