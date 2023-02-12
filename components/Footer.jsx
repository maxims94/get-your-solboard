import styles from '../styles/Home.module.css'

import { Group, UnstyledButton, ActionIcon } from '@mantine/core';
import { IconBrandTwitter, IconBrandGithub, IconMail, IconBrandLinkedin } from '@tabler/icons';

export default function Footer() {
    return (
        <div className={styles.Footer}>
            <Group>
                <ActionIcon size="lg" color="blue" radius="md" variant="outline" sx={{"&:hover": {"background-color": "#f5f5f5"}, "&:active": {transform: "none"}}}>
                  <a href="https://twitter.com/maximschmidt94" target="_blank">
                    <IconBrandTwitter color="#228be6" size={24} />
                  </a>
                </ActionIcon>
                <ActionIcon size="lg" color="dark" radius="md" variant="outline" sx={{"&:hover": {"background-color": "#f5f5f5"}, "&:active": {transform: "none"}}}>

                  <a href="https://github.com/maxims94/get-your-solboard" target="_blank">
                    <IconBrandGithub color="rgb(37, 38, 43)" size={24} />
                  </a>
                </ActionIcon>
                <ActionIcon size="lg" radius="md" variant="outline" sx={{"&:hover": {"background-color": "#f5f5f5"}, "&:active": {transform: "none"}}}>
                  <a href="mailto:maxim.schmidt@tum.de">
                    <IconMail color="gray" size={24} />
                  </a>
                </ActionIcon>
                <ActionIcon size="lg" color="dark" radius="md" variant="outline" sx={{"&:hover": {"background-color": "#f5f5f5"}, "&:active": {transform: "none"}}}>
                  <a href="https://www.linkedin.com/in/maxim-schmidt" target="_blank">
                    <IconBrandLinkedin color="rgb(37, 38, 43)" size={24} />
                  </a>
                </ActionIcon>
            </Group>
        </div>
    )
}
