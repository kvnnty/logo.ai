"use client";

import React from 'react';
import { Stage, Layer, Text, Rect, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

// Suppress Konva multiple instance warning (common in Next.js due to HMR and development mode)
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = String(args[0] || '');
    if (message.includes('Several Konva instances detected')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

interface ElementProps {
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  onContextMenu?: (ev: MouseEvent) => void;
}

const ImageElement = ({ element, isSelected, onSelect, onChange, onContextMenu }: ElementProps) => {
  const [img] = useImage(element.src);
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        onClick={onSelect}
        onTap={onSelect}
        onContextMenu={onContextMenu ? (e) => { e.evt.preventDefault(); onContextMenu(e.evt); } : undefined}
        ref={shapeRef}
        {...element}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const TextElement = ({ element, isSelected, onSelect, onChange, onContextMenu }: ElementProps) => {
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTextDblClick = (e: any) => {
    // Hide text and transformer while editing
    const textNode = shapeRef.current;
    const stage = textNode.getStage();
    const textPosition = textNode.absolutePosition();
    const areaPosition = {
      x: stage.container().offsetLeft + textPosition.x,
      y: stage.container().offsetTop + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width() * textNode.getAbsoluteScale().x + 'px';
    textarea.style.height = textNode.height() * textNode.getAbsoluteScale().y + 20 + 'px';
    textarea.style.fontSize = textNode.fontSize() * textNode.getAbsoluteScale().y + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();

    textarea.focus();

    const removeTextarea = () => {
      window.removeEventListener('click', handleOutsideClick);
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      textNode.show();
      if (trRef.current) trRef.current.show();
    };

    const handleOutsideClick = (e: any) => {
      if (e.target !== textarea) {
        onChange({ ...element, content: textarea.value });
        removeTextarea();
      }
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        onChange({ ...element, content: textarea.value });
        removeTextarea();
      }
      if (e.keyCode === 27) {
        removeTextarea();
      }
    });

    textNode.hide();
    if (trRef.current) trRef.current.hide();
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        onContextMenu={onContextMenu ? (e) => { e.evt.preventDefault(); onContextMenu(e.evt); } : undefined}
        ref={shapeRef}
        {...element}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            rotation: node.rotation(),
          });
        }}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        text={element.content}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const ShapeElement = ({ element, isSelected, onSelect, onChange, onContextMenu }: ElementProps) => {
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    ...element,
    onClick: onSelect,
    onTap: onSelect,
    onContextMenu: onContextMenu ? (e: any) => { e.evt.preventDefault(); onContextMenu(e.evt); } : undefined,
    ref: shapeRef,
    draggable: true,
    onDragEnd: (e: any) => {
      onChange({
        ...element,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      const updates: any = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      };

      if (element.type === 'circle') {
        updates.radius = Math.max(5, (node.width() * scaleX) / 2);
      } else {
        updates.width = Math.max(5, node.width() * scaleX);
        updates.height = Math.max(5, node.height() * scaleY);
      }

      onChange({
        ...element,
        ...updates
      });
    }
  };

  return (
    <React.Fragment>
      {element.type === 'rect' && <Rect {...commonProps} />}
      {element.type === 'circle' && (
        <Circle
          {...commonProps}
          radius={element.radius || 50}
          x={commonProps.x + (element.radius || 50)}
          y={commonProps.y + (element.radius || 50)}
          onDragEnd={(e) => {
            onChange({
              ...element,
              x: e.target.x() - (element.radius || 50),
              y: e.target.y() - (element.radius || 50),
            });
          }}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={element.type === 'circle'}
          enabledAnchors={element.type === 'circle' ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : undefined}
        />
      )}
    </React.Fragment>
  );
};

interface CanvasRendererProps {
  sceneData: any;
  selectedId: any;
  onSelect: (id: any) => void;
  onUpdateElement: (id: any, newAttrs: any) => void;
  onElementContextMenu?: (index: number, ev: MouseEvent) => void;
  scale?: number;
}

export const CanvasRenderer = React.forwardRef(({ sceneData, selectedId, onSelect, onUpdateElement, onElementContextMenu, scale = 0.5 }: CanvasRendererProps, ref: any) => {
  if (!sceneData) return null;

  return (
    <Stage
      width={sceneData.width * scale}
      height={sceneData.height * scale}
      scaleX={scale}
      scaleY={scale}
      ref={ref}
      onMouseDown={(e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
          onSelect(null);
        }
      }}
      onContextMenu={(e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty && onElementContextMenu) {
          e.evt.preventDefault();
          onElementContextMenu(-1, e.evt);
        }
      }}
    >
      <Layer>
        {sceneData.elements?.map((el: any, i: number) => {
          const isSelected = selectedId === i;
          const commonProps = {
            element: el,
            isSelected,
            onSelect: () => onSelect(i),
            onChange: (newAttrs: any) => onUpdateElement(i, newAttrs),
            onContextMenu: onElementContextMenu ? (ev: MouseEvent) => onElementContextMenu(i, ev) : undefined
          };

          if (el.type === 'text') return <TextElement key={i} {...commonProps} />;
          if (el.type === 'image') return <ImageElement key={i} {...commonProps} />;
          if (el.type === 'rect' || el.type === 'shape' || el.type === 'circle') return <ShapeElement key={i} {...commonProps} />;
          return null;
        })}
      </Layer>
    </Stage>
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';
