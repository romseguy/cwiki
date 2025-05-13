import { LinkIcon } from "@chakra-ui/icons";
import {
  IconButton,
  IconButtonProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tooltip
} from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import React, { useState } from "react";
import { FaShare } from "react-icons/fa";
import { LinkShare } from "features/common";
import { ITopic } from "models/Topic";
import { normalize } from "utils/string";

export const TopicsListItemShare = ({
  topic,
  ...props
}: IconButtonProps & { topic: Partial<ITopic> }) => {
  const toast = useToast({ position: "top" });
  const [isOpen, setIsOpen] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_URL}/${
    topic.org ? topic.org.orgUrl : topic.event ? topic.event.eventUrl : ""
  }/discussions/${normalize(topic.topicName)}`;

  return (
    <Popover closeOnBlur isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <PopoverTrigger>
        <div>
          <Tooltip label="Partager la discussion">
            <IconButton
              icon={<FaShare />}
              boxSize={4}
              bgColor="transparent"
              _hover={{ bg: "transparent", color: "white" }}
              height="auto"
              minWidth={0}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              {...props}
            />
          </Tooltip>
        </div>
      </PopoverTrigger>
      <PopoverContent width="auto">
        <PopoverBody onClick={(e) => e.stopPropagation()}>
          <LinkShare label="Copier le lien de la discussion" url={url} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
