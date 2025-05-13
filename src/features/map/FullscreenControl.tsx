import { Button } from "@chakra-ui/react";
import React, { useState } from "react";
import { css } from "@emotion/react";

export const FullscreenControl = ({
  onClick
}: {
  onClick?: (isFull: boolean) => void;
}) => {
  const [isFull, setIsFull] = useState(false);

  return (
    <Button
      className="gm-control-active gm-fullscreen-control"
      draggable="false"
      aria-label="Passer en plein écran"
      title="Passer en plein écran"
      type="button"
      onClick={() => {
        const f = !isFull;
        setIsFull(f);
        onClick && onClick(f);
      }}
      css={css`
        background: none rgb(255, 255, 255);
        border: 0px;
        margin: 10px;
        padding: 0px;
        text-transform: none;
        appearance: none;
        position: absolute;
        cursor: pointer;
        user-select: none;
        border-radius: 2px;
        height: 40px;
        width: 40px;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
        overflow: hidden;
        top: 0px;
        right: 0px;
      `}
    >
      <>
        <img
          src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
          alt=""
          css={css`
            height: 18px;
            width: 18px;
          `}
        />
        <img
          src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
          alt=""
          css={css`
            height: 18px;
            width: 18px;
          `}
        />
        <img
          src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
          alt=""
          css={css`
            height: 18px;
            width: 18px;
          `}
        />
      </>
    </Button>
  );
};
