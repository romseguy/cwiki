import { LinkIcon } from "@chakra-ui/icons";
import {
  IconButton,
  IconButtonProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useToast
} from "@chakra-ui/react";
import { LinkShare } from "features/common";
import { ITopic } from "models/Topic";
import React, { useState } from "react";
import { FaShare } from "react-icons/fa";
import { normalize } from "utils/string";

export const TopicsListItemShare = ({
  topic,
  ...props
}: IconButtonProps & { topic: Partial<ITopic> }) => {
  const toast = useToast({ position: "top" });
  const [isOpen, setIsOpen] = useState(false);
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/${
    topic.org ? topic.org.orgUrl : topic.event ? topic.event.eventUrl : ""
  }/discussions`;
  const url = `${baseUrl}/${normalize(topic.topicName)}`;
  const url2 = `${baseUrl}/${topic._id}`;

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
          <LinkShare label="Copier le lien de la discussion" url={url} mr={3} />
          <LinkShare
            label="Copier le lien permanent vers la discussion"
            url={url2}
            tooltipProps={{ placement: "right" }}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
