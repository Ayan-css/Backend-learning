export const UserRoleEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN : "project_admin",
    MEMBER : "member0"
}

export const AvailableUserRole = Object.values(UserRoleEnum)

export const TaskStatusEnum = {
    TODO : "todo",
    IN_PROGRESS : "in_progress",
    DONE : "done"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum)