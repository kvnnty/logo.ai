"use client";

import React from 'react';
import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

interface ElementProps {
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

const ImageElement = ({ element, isSelected, onSelect, onChange }: ElementProps) => {
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

const TextElement = ({ element, isSelected, onSelect, onChange }: ElementProps) => {
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
      <Text
        onClick={onSelect}
        onTap={onSelect}
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
        onDblClick={() => {
          const newText = prompt("Edit text:", element.content);
          if (newText !== null) {
            onChange({ ...element, content: newText });
          }
        }}
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

const ShapeElement = ({ element, isSelected, onSelect, onChange }: ElementProps) => {
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (element.type === 'rect') {
    return (
      <React.Fragment>
        <Rect
          onClick={onSelect}
          onTap={onSelect}
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
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }}
        />
        {isSelected && <Transformer ref={trRef} />}
      </React.Fragment>
    );
  }
  return null;
};

interface CanvasRendererProps {
  sceneData: any;
  selectedId: any;
  onSelect: (id: any) => void;
  onUpdateElement: (id: any, newAttrs: any) => void;
}

export const CanvasRenderer = React.forwardRef(({ sceneData, selectedId, onSelect, onUpdateElement }: CanvasRendererProps, ref: any) => {
  if (!sceneData) return null;

  return (
    <Stage
      width={sceneData.width}
      height={sceneData.height}
      scaleX={0.5} // Preview scale
      scaleY={0.5}
      ref={ref}
      onMouseDown={(e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
          onSelect(null);
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
            onChange: (newAttrs: any) => onUpdateElement(i, newAttrs)
          };

          if (el.type === 'text') return <TextElement key={i} {...commonProps} />;
          if (el.type === 'image') return <ImageElement key={i} {...commonProps} />;
          if (el.type === 'rect' || el.type === 'shape') return <ShapeElement key={i} {...commonProps} />;
          return null;
        })}
      </Layer>
    </Stage>
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';
